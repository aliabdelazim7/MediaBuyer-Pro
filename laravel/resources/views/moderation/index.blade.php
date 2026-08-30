@extends('layouts.app')

@section('title', 'الموديريشن والتفاعل الذكي - MediaBuyer Pro')

@section('content')
<div class="space-y-6" x-data="moderationManager()">
    <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2">
                <i data-lucide="message-circle" class="w-5 h-5 text-blue-400"></i>
                <span>مركز الموديريشن والردود الذكية (Social Moderation Hub)</span>
            </h1>
            <p class="text-xs text-[#8b9bb4] mt-0.5">
                تصفية التعليقات حسب الصفحة، تصنيف النوايا والمشاعر، والردود المقترحة بالذكاء الاصطناعي
            </p>
        </div>
    </div>

    <!-- Comments List -->
    <div class="space-y-3">
        @forelse($comments as $comment)
            <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 space-y-3 hover:border-[#28344c] transition shadow-sm">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                            {{ mb_substr($comment->sender_name, 0, 2) }}
                        </div>
                        <div>
                            <h4 class="text-xs font-bold text-[#f1f5f9]">{{ $comment->sender_name }}</h4>
                            <p class="text-[10px] text-[#64748b] font-mono">{{ $comment->page?->name ?? 'الصفحة الرسمية' }}</p>
                        </div>
                    </div>

                    <span class="px-2.5 py-0.5 rounded text-[10px] font-semibold {{ $comment->sentiment === 'INQUIRY_PRICE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ($comment->sentiment === 'NEGATIVE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20') }}">
                        {{ $comment->sentiment }}
                    </span>
                </div>

                <div class="p-3 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#cbd5e1] leading-relaxed">
                    {{ $comment->message }}
                </div>

                @if($comment->reply_message)
                    <div class="p-3 bg-[#161f30] border border-blue-500/20 rounded-xl text-xs text-blue-300">
                        <span class="font-bold block text-[10px] text-blue-400">الرد المرسل:</span>
                        {{ $comment->reply_message }}
                    </div>
                @endif
            </div>
        @empty
            <div class="bg-[#111622] border border-[#1e2638] rounded-2xl p-10 text-center text-xs text-[#64748b]">
                لا توجد تعليقات جديدة حالياً.
            </div>
        @endforelse
    </div>
</div>

<script>
function moderationManager() {
    return {}
}
</script>
@endsection
