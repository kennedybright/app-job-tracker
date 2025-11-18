import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'job-tracker-applications-react-v1';

const sampleApplications = [
  {
    id: crypto.randomUUID(),
    company: 'Notion',
    role: 'Product Manager, Growth',
    jobLink: 'https://www.notion.so/careers',
    applied: true,
    recruiter: false,
    followUp: '2024-05-21',
    priority: 'high',
    resume: 'https://drive.google.com/notion-resume',
    coverLetter: 'https://drive.google.com/notion-cover',
    notes: 'Sent via career page. Waiting on hiring manager review.',
  },
  {
    id: crypto.randomUUID(),
    company: 'Figma',
    role: 'Senior Product Designer',
    jobLink: 'https://www.figma.com/careers',
    applied: false,
    recruiter: true,
    followUp: '2024-05-24',
    priority: 'medium',
    resume: 'https://drive.google.com/resume-v7',
    coverLetter: '',
    notes: 'Inbound recruiter via LinkedIn. Need to tailor resume to design systems work.',
  },
  {
    id: crypto.randomUUID(),
    company: 'Linear',
    role: 'Head of Product Marketing',
    jobLink: 'https://linear.app/careers',
    applied: true,
    recruiter: false,
    followUp: '',
    priority: 'low',
    resume: '',
    coverLetter: '',
    notes: 'On-site interview scheduled for next week.',
  },
];

const defaultForm = {
  company: '',
  role: '',
  jobLink: '',
  applied: false,
  recruiter: false,
  followUp: '',
  priority: 'medium',
  resume: '',
  coverLetter: '',
  notes: '',
};

const priorityLabel = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const priorityColors = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};

function App() {
  const [applications, setApplications] = useState(() => loadApplications());
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState(defaultForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const text = search.toLowerCase();
    return applications.filter((app) => {
      const haystack = `${app.company} ${app.role} ${app.notes}`.toLowerCase();
      const matchesSearch = haystack.includes(text);
      const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [applications, search, priorityFilter]);

  const stats = useMemo(() => {
    const applied = applications.filter((app) => app.applied).length;
    const dueFollowUps = applications.filter(
      (app) => app.followUp && new Date(app.followUp) <= new Date()
    ).length;
    return {
      total: applications.length,
      applied,
      dueFollowUps,
    };
  }, [applications]);

  const openModal = (application = null) => {
    if (application) {
      setFormState({ ...application });
      setEditingId(application.id);
    } else {
      setFormState(defaultForm);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormState(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingId) {
      setApplications((prev) =>
        prev.map((app) => (app.id === editingId ? { ...formState, id: editingId } : app))
      );
    } else {
      setApplications((prev) => [...prev, { ...formState, id: crypto.randomUUID() }]);
    }
    closeModal();
  };

  const handleToggleApplied = (id) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, applied: !app.applied } : app))
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this application? This action cannot be undone.')) {
      setApplications((prev) => prev.filter((app) => app.id !== id));
    }
  };

  const resetFilters = () => {
    setSearch('');
    setPriorityFilter('all');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-display text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <header className="rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-900 p-8 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/80">Personal CRM</p>
              <h1 className="mt-2 text-3xl font-semibold">Job Application Operating System</h1>
              <p className="mt-2 max-w-3xl text-base text-white/80">
                Track every application, follow-up, and tailored resume in a workspace that feels as fluid as Google Sheets
                and as rich as Airtable.
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/40"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Add new application
            </button>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Active roles" value={stats.total} />
            <StatCard label="Applied" value={stats.applied} />
            <StatCard label="Follow-ups due" value={stats.dueFollowUps} />
          </dl>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[200px] flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company, role, recruiter..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={resetFilters}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              Reset
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-0 shadow-xl ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="border-b border-slate-200 px-6 py-3">Company / Role</th>
                  <th className="border-b border-slate-200 px-6 py-3">Job post</th>
                  <th className="border-b border-slate-200 px-6 py-3">Status</th>
                  <th className="border-b border-slate-200 px-6 py-3">Follow-up</th>
                  <th className="border-b border-slate-200 px-6 py-3">Priority</th>
                  <th className="border-b border-slate-200 px-6 py-3">Docs</th>
                  <th className="border-b border-slate-200 px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                      No applications match your filters yet. Add one to get started!
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onToggleApplied={() => handleToggleApplied(application.id)}
                      onEdit={() => openModal(application)}
                      onDelete={() => handleDelete(application.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-500">
            Data is securely stored in your browser using localStorage.
          </div>
        </section>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal} title={editingId ? 'Edit application' : 'New application'}>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Company" required>
                <input
                  required
                  value={formState.company}
                  onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="Acme"
                />
              </FormField>
              <FormField label="Role" required>
                <input
                  required
                  value={formState.role}
                  onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="Product Manager"
                />
              </FormField>
            </div>
            <FormField label="Job post link">
              <input
                type="url"
                value={formState.jobLink}
                onChange={(event) => setFormState((prev) => ({ ...prev, jobLink: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                placeholder="https://company.com/jobs"
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Priority">
                <select
                  value={formState.priority}
                  onChange={(event) => setFormState((prev) => ({ ...prev, priority: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </FormField>
              <FormField label="Follow-up date">
                <input
                  type="date"
                  value={formState.followUp}
                  onChange={(event) => setFormState((prev) => ({ ...prev, followUp: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Status" helper="Track whether you've applied or it's still a draft.">
                <div className="mt-1 flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formState.applied}
                      onChange={(event) => setFormState((prev) => ({ ...prev, applied: event.target.checked }))}
                      className="rounded-full border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    Applied
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formState.recruiter}
                      onChange={(event) => setFormState((prev) => ({ ...prev, recruiter: event.target.checked }))}
                      className="rounded-full border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    Recruiter sourced
                  </label>
                </div>
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Resume link">
                <input
                  type="url"
                  value={formState.resume}
                  onChange={(event) => setFormState((prev) => ({ ...prev, resume: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="https://drive.google.com/resume"
                />
              </FormField>
              <FormField label="Cover letter link">
                <input
                  type="url"
                  value={formState.coverLetter}
                  onChange={(event) => setFormState((prev) => ({ ...prev, coverLetter: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="https://drive.google.com/cover-letter"
                />
              </FormField>
            </div>
            <FormField label="Notes">
              <textarea
                rows={4}
                value={formState.notes}
                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                placeholder="Interview prep, tailored resume reminders, next steps..."
              />
            </FormField>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
              >
                {editingId ? 'Save changes' : 'Add application'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function loadApplications() {
  if (typeof window === 'undefined') {
    return sampleApplications;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return sampleApplications;
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return sampleApplications;
  } catch (error) {
    console.error('Failed to parse stored applications', error);
    return sampleApplications;
  }
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <dt className="text-xs uppercase tracking-wide text-white/70">{label}</dt>
      <dd className="mt-2 text-3xl font-semibold">{value}</dd>
    </div>
  );
}

function ApplicationRow({ application, onToggleApplied, onEdit, onDelete }) {
  const followUpDue = application.followUp && new Date(application.followUp) <= new Date();

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
      <td className="px-6 py-4 align-top">
        <div className="font-semibold text-slate-900">{application.company}</div>
        <div className="text-sm text-slate-500">{application.role}</div>
        {application.notes && <p className="mt-2 text-xs text-slate-400">{application.notes}</p>}
      </td>
      <td className="px-6 py-4 align-top">
        {application.jobLink ? (
          <a href={application.jobLink} target="_blank" rel="noopener" className="text-brand-600 hover:underline">
            View post
          </a>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-6 py-4 align-top space-y-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {application.applied ? 'Applied' : 'Draft'}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            application.recruiter ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {application.recruiter ? 'Recruiter' : 'Self-sourced'}
        </span>
      </td>
      <td className="px-6 py-4 align-top">
        {application.followUp ? (
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              followUpDue ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            <ClockIcon />
            {new Date(application.followUp).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-slate-400">Not set</span>
        )}
      </td>
      <td className="px-6 py-4 align-top">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${priorityColors[application.priority]}`}>
          {priorityLabel[application.priority]}
        </span>
      </td>
      <td className="px-6 py-4 align-top">
        {application.resume || application.coverLetter ? (
          <div className="flex flex-wrap gap-2 text-sm">
            {application.resume && (
              <a href={application.resume} target="_blank" rel="noopener" className="text-brand-600 hover:underline">
                Resume
              </a>
            )}
            {application.resume && application.coverLetter && <span className="text-slate-300">·</span>}
            {application.coverLetter && (
              <a href={application.coverLetter} target="_blank" rel="noopener" className="text-brand-600 hover:underline">
                Cover Letter
              </a>
            )}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-6 py-4 align-top text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={onToggleApplied}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700"
          >
            {application.applied ? 'Mark draft' : 'Mark applied'}
          </button>
          <button
            onClick={onEdit}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">Store every detail needed to ace your follow-up.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="sr-only">Close</span>
            <CloseIcon />
          </button>
        </div>
        <div className="grid gap-4 p-6">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, helper, required, children }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-rose-500"> *</span>}
      {helper && <p className="text-xs font-normal text-slate-500">{helper}</p>}
      {children}
    </label>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default App;
