import Icon from './Icon';
import HabitMenu from './HabitMenu';
import ThemeToggle from './ThemeToggle';
import { CATEGORIES } from '../utils/categories';

function Avatar({ name, size = 'h-7 w-7 text-[11px]' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 font-semibold text-white ${size}`}
    >
      {initials || '?'}
    </span>
  );
}

function NavItem({ icon, label, count, active, onClick, countClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[15px] transition ${
        active
          ? 'bg-orange-100 font-medium text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
          : 'text-stone-700 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:bg-stone-800'
      }`}
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && (
        <span
          className={`text-xs tabular-nums ${countClass || (active ? 'text-orange-700 dark:text-orange-300' : 'text-stone-400 dark:text-stone-500')}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Todoist-style navigation shown after signing in. On large screens it sits
// beside the content and can be collapsed; on phones it slides in over it.
export default function Sidebar({
  user,
  theme,
  onThemeChange,
  view,
  category,
  counts,
  categoryCounts,
  onNavigate,
  onSelectCategory,
  onAddHabit,
  onSearch,
  onOpenSettings,
  onOpenShortcuts,
  onLogout,
  onCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const views = [
    {
      id: 'today',
      label: 'Today',
      icon: 'today',
      count: counts.todo,
      countClass: 'text-orange-600 dark:text-orange-400',
    },
    { id: 'habits', label: 'All habits', icon: 'list', count: counts.active },
    { id: 'board', label: 'Board', icon: 'board' },
    { id: 'stats', label: 'Stats', icon: 'stats' },
    { id: 'archived', label: 'Archived', icon: 'archive', count: counts.archived },
  ];
  const usedCategories = CATEGORIES.filter((c) => categoryCounts[c.id]);

  return (
    <>
      {/* backdrop for the phone drawer */}
      {mobileOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-stone-200 bg-stone-100 transition-transform duration-200 dark:border-stone-800 dark:bg-stone-900 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-4">
          <HabitMenu
            label="Account menu"
            align="left"
            width="w-60"
            buttonClassName="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-stone-200/60 dark:hover:bg-stone-800"
            header={
              <div className="border-b border-stone-100 px-3.5 pb-2 pt-1.5 dark:border-stone-700">
                <p className="heading truncate text-sm font-semibold">{user.name}</p>
                <p className="muted truncate text-xs">{user.email}</p>
              </div>
            }
            items={[
              { label: 'Account settings', onClick: onOpenSettings },
              { label: 'Keyboard shortcuts', onClick: onOpenShortcuts },
              { label: 'Sign out', onClick: onLogout, danger: true },
            ]}
          >
            <Avatar name={user.name} />
            <span className="heading truncate text-sm font-semibold">
              {user.name.split(' ')[0]}
            </span>
            <Icon name="chevronDown" className="h-4 w-4 text-stone-400" />
          </HabitMenu>

          <div className="flex items-center gap-1">
            <ThemeToggle theme={theme} onChange={onThemeChange} />
            <button
              type="button"
              onClick={onCollapse}
              title="Hide sidebar ( [ )"
              aria-label="Hide sidebar"
              className="icon-btn hidden lg:flex"
            >
              <Icon name="sidebar" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="icon-btn lg:hidden"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <button
            type="button"
            onClick={onAddHabit}
            className="mb-2 mt-2 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[15px] font-semibold text-orange-600 transition hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
          >
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-orange-500 text-white">
              <Icon name="plus" className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            Add habit
          </button>

          <NavItem icon={<Icon name="search" />} label="Search" onClick={onSearch} />
          {views.map((v) => (
            <NavItem
              key={v.id}
              icon={<Icon name={v.icon} />}
              label={v.label}
              count={v.count}
              countClass={v.countClass}
              active={view === v.id && !(v.id === 'habits' && category !== 'all')}
              onClick={() => onNavigate(v.id)}
            />
          ))}

          {usedCategories.length > 0 && (
            <>
              <p className="mb-1 mt-6 px-2.5 text-sm font-semibold text-stone-500 dark:text-stone-400">
                Categories
              </p>
              {usedCategories.map((c) => (
                <NavItem
                  key={c.id}
                  icon={<Icon name="hash" className="h-4 w-4 text-stone-400" />}
                  label={c.label}
                  count={categoryCounts[c.id]}
                  active={view === 'habits' && category === c.id}
                  onClick={() => onSelectCategory(c.id)}
                />
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-stone-200 px-3 py-3 dark:border-stone-800">
          <NavItem
            icon={<Icon name="keyboard" />}
            label="Keyboard shortcuts"
            onClick={onOpenShortcuts}
          />
          <NavItem icon={<Icon name="settings" />} label="Settings" onClick={onOpenSettings} />
        </div>
      </aside>
    </>
  );
}
