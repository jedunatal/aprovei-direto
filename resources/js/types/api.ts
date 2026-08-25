export interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    email_verified_at: string | null;
    created_at: string;
}

export interface AuthResponse {
    message: string;
    access_token: string;
    token_type: string;
    user: User;
}

export interface Option {
    id: number;
    letter: string;
    text: string;
}

export interface Question {
    id: number;
    statement: string;
    year: number;
    difficulty: 'easy' | 'medium' | 'hard';
    metadata: Record<string, unknown> | null;
    discipline: { id: number; name: string; slug: string };
    topic: { id: number; name: string; slug: string };
    institution: { id: number; name: string; slug: string };
    options: Option[];
    last_attempt?: {
        selected_option_id: number;
        is_correct: boolean;
        answered_at: string;
    } | null;
}

export type QuestionStatus = 'draft' | 'review' | 'approved' | 'published' | 'rejected' | 'archived';

export interface AdminQuestion {
    id: number;
    external_id: string | null;
    year: number;
    difficulty: 'easy' | 'medium' | 'hard';
    status: QuestionStatus;
    status_label: string;
    statement: string;
    explanation: string;
    correct_option_id: number | null;
    correct_option_letter?: string;
    metadata: Record<string, unknown> | null;
    is_active: boolean;
    discipline: { id: number; name: string; slug: string };
    topic: { id: number; name: string; slug: string };
    institution: { id: number; name: string; slug: string };
    options: Option[];
    created_by: { id: number; name: string; email: string } | null;
    reviewed_by: { id: number; name: string; email: string } | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export type ImportBatchStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ImportMode = 'skip' | 'update' | 'upsert';

export interface QuestionImportBatch {
    id: number;
    file_name: string;
    file_size: number;
    import_mode: ImportMode;
    import_mode_label: string;
    status: ImportBatchStatus;
    status_label: string;
    total_records: number;
    processed_records: number;
    successful_records: number;
    failed_records: number;
    progress_percent: number;
    error_summary: string | null;
    user: { id: number; name: string; email: string };
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

export interface QuestionImportError {
    id: number;
    import_batch_id: number;
    line_number: number;
    external_id: string | null;
    payload: Record<string, unknown> | null;
    error_message: string;
    created_at: string;
}

export interface AnswerResponse {
    is_correct: boolean;
    selected_option_id: number;
    correct_option_id: number;
    explanation: string;
    answered_at: string;
}

export interface Discipline {
    id: number;
    name: string;
    slug: string;
    topics?: { id: number; discipline_id: number; name: string; slug: string }[];
    questions_count?: number;
}

export interface Institution {
    id: number;
    name: string;
    slug: string;
    questions_count?: number;
}

export interface DashboardStats {
    overview: {
        answered: number;
        correct: number;
        incorrect: number;
        accuracy: number;
    };
    disciplines: Array<{
        id: number;
        name: string;
        slug: string;
        answered: number;
        correct: number;
        incorrect: number;
        accuracy: number;
    }>;
    daily: Array<{
        date: string;
        answered: number;
        correct: number;
        incorrect: number;
    }>;
    errors: Array<{
        id: number;
        statement: string;
        year: number;
        difficulty: string;
        discipline: string;
        topic: string;
        institution: string;
    }>;
}

export interface PixCheckoutData {
    payment_id: string;
    status: string;
    amount: number;
    qr_code: string;
    copy_and_paste: string;
    expires_at: string;
}

export interface SubscriptionStatus {
    has_subscription: boolean;
    subscription: {
        id: number;
        plan: string;
        status: string;
        amount: number;
        is_active: boolean;
        starts_at: string;
        expires_at: string;
    } | null;
}
