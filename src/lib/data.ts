// Centralized Data for DayPilot AI

export interface NavItem {
    id: string;
    label: string;
    icon: string;
    href: string;
}

export interface Insight {
    category: string;
    title: string;
    description: string;
    icon: string;
    status: string;
    type: string;
}

export interface Commitment {
    sender: string;
    subject: string;
    time: string;
    summary: string;
    urgent: boolean;
}

export interface Email {
    sender: string;
    subject: string;
    time: string;
    preview: string;
}

export interface Meeting {
    title: string;
    time: string;
    zoom: string;
    briefing: {
        lastDiscussed: string;
        links: string[];
    };
    urgent: boolean;
}

export interface TimelineItem {
    time: string;
    title: string;
    team: string;
    context: string;
    type: string;
    missing?: boolean;
}

export interface FinanceAlert {
    title: string;
    description: string;
    type: string;
    icon: string;
    action: string;
}

export interface Bill {
    category: string;
    date: string;
    amount: number;
    icon: string;
    color: string;
}

export interface Transaction {
    name: string;
    category: string;
    date: string;
    amount: number;
    icon: string;
    positive?: boolean;
}

export interface Task {
    id: number;
    title: string;
    priority: string;
    due: string;
    status: string;
    category: string;
}

export const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/' },
    { id: 'gmail', label: 'Email', icon: 'mail', href: '/gmail' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_today', href: '/calendar' },
    { id: 'finance', label: 'Finance', icon: 'payments', href: '/finance' },
    { id: 'tasks', label: 'Tasks', icon: 'task_alt', href: '/tasks' }
];

export const insights: Insight[] = [
    { category: "Email", title: "1 Urgent Commitment", description: "Follow up with the Design Team regarding the Q3 proposal.", icon: "mail", status: "Pending since 8:45 AM", type: "primary" },
    { category: "Calendar", title: "Next: Project Sync", description: "10:00 AM • Room 402. All prep materials are synchronized.", icon: "calendar_today", status: "Starting in 45 mins", type: "secondary" },
    { category: "Finance", title: "Upcoming Bill: $150", description: "Adobe Creative Cloud subscription due tomorrow.", icon: "payments", status: "Auto-pay enabled", type: "tertiary" },
    { category: "Tasks", title: "2 Reminders Today", description: "Call the pharmacy and update Jira sprint board.", icon: "task_alt", status: "High Priority", type: "error" }
];

export const commitments: Commitment[] = [
    { sender: "Design Team", subject: "Q3 Proposal Review", time: "8:45 AM", summary: "Commitment: Review the final deck by EOD.", urgent: true },
    { sender: "Sarah Jenkins", subject: "Client Coffee", time: "Yesterday", summary: "Commitment: Send the portfolio link.", urgent: false }
];

export const emails: Email[] = [
    { sender: "Delta Airlines", subject: "Your flight to SFO is confirmed", time: "11:20 AM", preview: "Your flight DL123 is scheduled for departure..." },
    { sender: "Linear", subject: "New comment on [ENG-123]", time: "10:05 AM", preview: "Alex: I've updated the architecture diagram..." },
    { sender: "Medium", subject: "Daily Digest: AI in 2024", time: "9:00 AM", preview: "Top stories for you today..." }
];

export const prepMeetings: Meeting[] = [
    { title: "Q3 Performance Sync", time: "10:30 AM", zoom: "882-192", briefing: { lastDiscussed: "Q4 Goals & Budget constraints", links: ["Budget_Sheet_Final.pdf", "Q3_Deck_v2"] }, urgent: true }
];

export const timeline: TimelineItem[] = [
    { time: "1:00 PM", title: "Product Design Sync", team: "Design Team", context: "Focusing on the new 'Editorial' look for the dashboard. Reviewing mobile navigation patterns.", type: "primary" },
    { time: "3:30 PM", title: "Marketing Strategy", team: "Optional", context: "No previous documents found for this thread.", type: "error-outline", missing: true },
    { time: "5:00 PM", title: "Weekly Wrap-up", team: "Updates", context: "General updates.", type: "compact" }
];

export const alerts: FinanceAlert[] = [
    { title: "Low balance for upcoming auto-pay", description: "Rent payment ($2,100) due in 3 days. Current balance is $1,450.", type: "error", icon: "warning", action: "Transfer Funds" },
    { title: "Possible duplicate charge detected", description: "Two transactions of $45.00 at \"Star Coffee\" within 2 minutes.", type: "tertiary", icon: "content_copy", action: "Dispute Charge" }
];

export const bills: Bill[] = [
    { category: "Utilities", date: "Oct 24", amount: 142.10, icon: "bolt", color: "var(--primary)" },
    { category: "Internet", date: "Oct 28", amount: 89.00, icon: "wifi", color: "var(--on-tertiary-fixed-variant)" },
    { category: "Gym", date: "Nov 01", amount: 45.00, icon: "fitness_center", color: "var(--error)" }
];

export const transactions: Transaction[] = [
    { name: "Apple Store", category: "Electronics", date: "Today", amount: -1299.00, icon: "shopping_bag" },
    { name: "Paycheck Deposit", category: "Income", date: "Yesterday", amount: 4250.00, icon: "account_balance_wallet", positive: true },
    { name: "The Green Bistro", category: "Dining", date: "Oct 21", amount: -64.20, icon: "restaurant" }
];

export const tasks: Task[] = [
    { id: 1, title: "Call Pharmacy", priority: "High", due: "Today, 4:00 PM", status: "pending", category: "Personal" },
    { id: 2, title: "Update Jira Sprint Board", priority: "Medium", due: "Today, 6:00 PM", status: "pending", category: "Work" },
    { id: 3, title: "Project Sync Prep", priority: "High", due: "Tomorrow, 9:00 AM", status: "done", category: "Work" },
    { id: 4, title: "Book Flight to SFO", priority: "Medium", due: "Done", status: "done", category: "Travel" }
];
