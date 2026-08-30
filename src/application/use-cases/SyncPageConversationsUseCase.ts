import { prisma } from '../../infrastructure/db/prisma';

export class SyncPageConversationsUseCase {
  public async execute(userAccessToken?: string) {
    // 1. Resolve active user token
    const token =
      userAccessToken ||
      (await prisma.facebookUserAccount.findFirst({ where: { status: 'ACTIVE' }, orderBy: { updatedAt: 'desc' } }))?.accessToken ||
      process.env.META_ACCESS_TOKEN;

    if (!token || !token.startsWith('EAA')) {
      return { success: false, error: 'No valid Meta Access Token found' };
    }

    let syncedPagesCount = 0;
    let syncedConversationsCount = 0;
    let permissionMissing = false;

    try {
      // 2. Fetch all user pages with their Page Access Tokens
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,category&access_token=${token}`
      );
      const pagesData = await pagesRes.json();

      if (pagesData.data && Array.isArray(pagesData.data)) {
        for (const page of pagesData.data) {
          syncedPagesCount++;
          const pageToken = page.access_token || token;

          // 3. Fetch live conversations for each page
          const convUrl = `https://graph.facebook.com/v21.0/${page.id}/conversations?fields=id,snippet,updated_time,unread_count,participants,messages{id,message,from,created_time}&access_token=${pageToken}`;
          const convRes = await fetch(convUrl);
          const convData = await convRes.json();

          if (convData.error) {
            if (convData.error.message?.includes('pages_messaging')) {
              permissionMissing = true;
            }
            continue;
          }

          if (convData.data && Array.isArray(convData.data)) {
            for (const c of convData.data) {
              const customer = c.participants?.data?.find((p: any) => p.id !== page.id) || {
                name: 'عميل فيسبوك',
                id: c.id,
              };

              const conversation = await prisma.conversation.upsert({
                where: { platformThreadId: c.id },
                update: {
                  senderName: customer.name,
                  senderId: customer.id,
                  pageName: page.name,
                  lastMessageText: c.snippet || 'رسالة جديدة',
                  lastMessageAt: new Date(c.updated_time || Date.now()),
                  unreadCount: c.unread_count || 0,
                },
                create: {
                  platform: 'MESSENGER',
                  platformThreadId: c.id,
                  senderName: customer.name,
                  senderId: customer.id,
                  pageName: page.name,
                  lastMessageText: c.snippet || 'رسالة جديدة',
                  lastMessageAt: new Date(c.updated_time || Date.now()),
                  unreadCount: c.unread_count || 0,
                },
              });

              // Sync underlying messages
              if (c.messages?.data && Array.isArray(c.messages.data)) {
                for (const msg of c.messages.data) {
                  const isAgent = msg.from?.id === page.id;
                  await prisma.chatMessage.upsert({
                    where: { id: msg.id },
                    update: {},
                    create: {
                      id: msg.id,
                      conversationId: conversation.id,
                      senderType: isAgent ? 'AGENT' : 'CUSTOMER',
                      text: msg.message || '',
                      createdAt: new Date(msg.created_time || Date.now()),
                      isRead: true,
                    },
                  });
                }
              }

              syncedConversationsCount++;
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Error syncing page conversations:', err);
    }

    return {
      success: true,
      syncedPagesCount,
      syncedConversationsCount,
      permissionMissing,
    };
  }
}
