<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\SocialPage;
use App\Models\Lead;
use App\Services\AI\SentimentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ModerationController extends Controller
{
    public function __construct(
        protected SentimentService $sentimentService
    ) {}

    public function index(Request $request)
    {
        $pages = SocialPage::all();
        $comments = Comment::with('page')->latest()->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'comments' => $comments,
                'pages' => $pages,
            ]);
        }

        return view('moderation.index', compact('comments', 'pages'));
    }

    public function reply(Request $request, string $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);
        $replyText = $request->input('replyText');
        $isPrivate = $request->input('isPrivate', false);

        $comment->update([
            'status' => 'REPLIED',
            'reply_message' => $replyText,
            'replied_at' => now(),
            'is_private_replied' => $isPrivate,
        ]);

        return response()->json([
            'success' => true,
            'comment' => $comment,
            'message' => 'تم إرسال الرد بنجاح!',
        ]);
    }
}
