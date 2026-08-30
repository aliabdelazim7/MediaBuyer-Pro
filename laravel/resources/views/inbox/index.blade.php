@extends('layouts.app')

@section('title', 'صندوق الرسايل الموحد - MediaBuyer Pro')

@section('content')
<div class="space-y-4" x-data="inboxManager()">
    <!-- Top Header -->
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="space-y-0.5">
            <h1 class="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2">
                <i data-lucide="message-square" class="w-5 h-5 text-blue-400"></i>
                <span>صندوق الرسايل الموحد والمحادثات المباشرة (Unified Omnichannel Inbox)</span>
            </h1>
            <p class="text-xs text-[#8b9bb4]">
                فصل شاتات ورسائل كل صفحة في تبويب مستقل مع الرد الذكي والتحويل المباشر لـ CRM
            </p>
        </div>

        <button @click="fetchConversations()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161c2b] text-blue-400 border border-[#1e2638] text-xs font-semibold">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>تحديث الشاتات</span>
        </button>
    </div>

    <!-- Page Separator Tabs Bar -->
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-3 shadow-sm space-y-2">
        <div class="flex items-center gap-1.5 text-xs text-[#64748b] font-bold pb-1">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-400"></i>
            <span>اختر الصفحة لعرض محادثاتها بشكل منفصل:</span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <button @click="selectedPage = 'ALL'" :class="selectedPage === 'ALL' ? 'bg-[#1d4ed8] text-white font-bold' : 'bg-[#0b0e14] text-[#8b9bb4] border border-[#1e2638]'" class="px-3 py-2 rounded-xl text-xs whitespace-nowrap transition flex items-center gap-2">
                <span>كافة الصفحات</span>
                <span class="px-1.5 py-0.2 rounded-md text-[10px] bg-black/30 font-mono" x-text="conversations.length"></span>
            </button>

            <template x-for="p in uniquePages" :key="p">
                <button @click="selectedPage = p" :class="selectedPage === p ? 'bg-[#1d4ed8] text-white font-bold' : 'bg-[#0b0e14] text-[#8b9bb4] hover:text-white border border-[#1e2638]'" class="px-3 py-2 rounded-xl text-xs whitespace-nowrap transition flex items-center gap-2">
                    <span x-text="'📄 ' + p"></span>
                    <span class="px-1.5 py-0.2 rounded-md text-[10px] bg-black/30 font-mono" x-text="getPageCount(p)"></span>
                </button>
            </template>
        </div>
    </div>

    <!-- 3-Column Chat Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
        
        <!-- Left: Conversations List -->
        <div class="lg:col-span-4 bg-[#111622] border border-[#1e2638] rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div class="p-3.5 border-b border-[#1e2638] bg-[#0d111a]">
                <input type="text" x-model="search" placeholder="بحث في رسائل الصفحة..." class="w-full px-3 py-1.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-white">
            </div>

            <div class="flex-1 overflow-y-auto divide-y divide-[#1a2130]">
                <template x-for="conv in filteredConversations" :key="conv.id">
                    <div @click="selectConversation(conv)" :class="activeConv?.id === conv.id ? 'bg-[#161f30] border-r-4 border-blue-500' : 'hover:bg-[#151b27]'" class="p-3.5 cursor-pointer flex items-start gap-3 transition">
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            <span x-text="conv.sender_name.slice(0, 2)"></span>
                        </div>
                        <div class="flex-1 min-w-0 space-y-0.5">
                            <div class="flex items-center justify-between">
                                <h4 class="text-xs font-bold text-[#f1f5f9] truncate" x-text="conv.sender_name"></h4>
                                <span class="text-[10px] text-[#64748b] font-mono" x-text="conv.platform"></span>
                            </div>
                            <p class="text-[11px] text-[#8b9bb4] truncate" x-text="conv.last_message_text"></p>
                            <span class="text-[10px] text-[#64748b] font-mono block pt-1" x-text="conv.page_name"></span>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Center: Live Chat Messages -->
        <div class="lg:col-span-5 bg-[#111622] border border-[#1e2638] rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <template x-if="!activeConv">
                <div class="flex-1 flex items-center justify-center text-[#64748b] text-xs">
                    اختر محادثة لبدء الرد المباشر
                </div>
            </template>

            <template x-if="activeConv">
                <div class="flex-1 flex flex-col h-full">
                    <!-- Thread Header -->
                    <div class="p-3.5 border-b border-[#1e2638] flex items-center justify-between bg-[#0d111a] shrink-0">
                        <div>
                            <h3 class="text-xs font-bold text-[#f1f5f9]" x-text="activeConv.sender_name"></h3>
                            <p class="text-[10px] text-[#8b9bb4]" x-text="activeConv.page_name + ' • ' + activeConv.platform"></p>
                        </div>
                        <button @click="generateAiDraft()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold transition">
                            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400"></i>
                            <span>اقتراح رد AI</span>
                        </button>
                    </div>

                    <!-- Messages Body -->
                    <div class="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b0e14]/50">
                        <template x-for="msg in activeConv.messages" :key="msg.id">
                            <div :class="msg.sender_type === 'AGENT' ? 'flex flex-col items-end' : 'flex flex-col items-start'">
                                <div :class="msg.sender_type === 'AGENT' ? 'bg-[#1d4ed8] text-white rounded-br-none' : 'bg-[#161c2b] text-[#f1f5f9] border border-[#242e42] rounded-bl-none'" class="max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed" x-text="msg.text"></div>
                            </div>
                        </template>
                    </div>

                    <!-- Reply Input Form -->
                    <form @submit.prevent="sendMessage()" class="p-3 border-t border-[#1e2638] bg-[#0d111a] flex items-center gap-2 shrink-0">
                        <input type="text" x-model="replyText" placeholder="اكتب ردك للعميل هنا..." class="flex-1 p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-white">
                        <button type="submit" class="p-2.5 rounded-xl bg-[#1d4ed8] text-white"><i data-lucide="send" class="w-4 h-4"></i></button>
                    </form>
                </div>
            </template>
        </div>

        <!-- Right: Customer Info & CRM Actions -->
        <div class="lg:col-span-3 bg-[#111622] border border-[#1e2638] rounded-2xl p-4 shadow-sm space-y-4 flex flex-col justify-between">
            <template x-if="activeConv">
                <div class="space-y-4">
                    <div class="text-center space-y-2 pb-4 border-b border-[#1e2638]">
                        <div class="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-md">
                            <span x-text="activeConv.sender_name.slice(0, 2)"></span>
                        </div>
                        <h3 class="text-sm font-bold text-[#f1f5f9]" x-text="activeConv.sender_name"></h3>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20" x-text="activeConv.page_name"></span>
                    </div>

                    <div class="space-y-2 text-xs">
                        <div class="p-2.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] flex justify-between">
                            <span class="text-[#64748b]">المنصة:</span>
                            <span class="font-bold text-white font-mono" x-text="activeConv.platform"></span>
                        </div>
                        <div class="p-2.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] flex justify-between">
                            <span class="text-[#64748b]">التصنيف:</span>
                            <span class="font-bold text-emerald-400">🔥 استفسار عن السعر</span>
                        </div>
                    </div>

                    <button @click="convertToLead()" class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition">
                        <i data-lucide="user-plus" class="w-4 h-4"></i>
                        <span>تحويل إلى عميل في الـ CRM</span>
                    </button>
                </div>
            </template>
        </div>

    </div>
</div>

<script>
function inboxManager() {
    return {
        conversations: @json($conversations),
        activeConv: null,
        selectedPage: 'ALL',
        search: '',
        replyText: '',
        init() {
            if (this.conversations.length > 0) {
                this.selectConversation(this.conversations[0]);
            }
        },
        get uniquePages() {
            return [...new Set(this.conversations.map(c => c.page_name).filter(Boolean))];
        },
        getPageCount(pageName) {
            return this.conversations.filter(c => c.page_name === pageName).length;
        },
        get filteredConversations() {
            return this.conversations.filter(c => {
                const matchPage = this.selectedPage === 'ALL' || c.page_name === this.selectedPage;
                const matchSearch = c.sender_name.toLowerCase().includes(this.search.toLowerCase()) || c.last_message_text.toLowerCase().includes(this.search.toLowerCase());
                return matchPage && matchSearch;
            });
        },
        async selectConversation(conv) {
            this.activeConv = conv;
            const res = await fetch(`/api/messages/${conv.id}`);
            const data = await res.json();
            if (data.success) {
                this.activeConv = data.conversation;
                this.$nextTick(() => lucide.createIcons());
            }
        },
        async sendMessage() {
            if (!this.replyText || !this.activeConv) return;
            const text = this.replyText;
            this.replyText = '';
            const res = await fetch(`/api/messages/${this.activeConv.id}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.success) {
                this.activeConv.messages.push(data.message);
                this.activeConv.last_message_text = text;
            }
        },
        async generateAiDraft() {
            if (!this.activeConv) return;
            const res = await fetch(`/api/messages/${this.activeConv.id}/ai-draft`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                this.replyText = data.aiDraft;
            }
        },
        async convertToLead() {
            if (!this.activeConv) return;
            const res = await fetch(`/api/messages/${this.activeConv.id}/convert-to-lead`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
            }
        }
    }
}
</script>
@endsection
