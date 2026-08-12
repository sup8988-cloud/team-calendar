import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const ROLE_DEFINITIONS = Object.freeze([
  { name: "팀장", color: "#E5484D" },
  { name: "인사", color: "#246BFD" },
  { name: "감찰", color: "#22A06B" },
  { name: "교육", color: "#F59E0B" },
  { name: "안전", color: "#7C3AED" }
]);

const ROLE_COLOR = Object.freeze(Object.fromEntries(ROLE_DEFINITIONS.map((role) => [role.name, role.color])));
const COLOR_PALETTE = ROLE_DEFINITIONS.map((role) => role.color);

const DEMO_PROFILES = ROLE_DEFINITIONS.map((role, index) => ({
  id: `demo-${index + 1}`,
  display_name: role.name,
  color: role.color
}));

const config = Object.freeze({
  SUPABASE_URL: window.APP_CONFIG?.SUPABASE_URL?.trim() || "",
  SUPABASE_PUBLISHABLE_KEY: window.APP_CONFIG?.SUPABASE_PUBLISHABLE_KEY?.trim() || "",
  APP_NAME: window.APP_CONFIG?.APP_NAME?.trim() || "우리팀 일정 캘린더",
  TEAM_NAME: window.APP_CONFIG?.TEAM_NAME?.trim() || "공유 일정",
  ALLOW_SIGN_UP: window.APP_CONFIG?.ALLOW_SIGN_UP !== false,
  ENABLE_DEMO: window.APP_CONFIG?.ENABLE_DEMO !== false
});

const isSupabaseConfigured =
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.SUPABASE_URL) &&
  config.SUPABASE_PUBLISHABLE_KEY.length > 20 &&
  !config.SUPABASE_URL.includes("YOUR_PROJECT") &&
  !config.SUPABASE_PUBLISHABLE_KEY.includes("YOUR_");

const supabase = isSupabaseConfigured
  ? createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY)
  : null;

const $ = (selector) => document.querySelector(selector);
const elements = {
  authView: $("#authView"),
  calendarView: $("#calendarView"),
  loginTab: $("#loginTab"),
  signupTab: $("#signupTab"),
  authForm: $("#authForm"),
  nameField: $("#nameField"),
  displayName: $("#displayName"),
  email: $("#email"),
  password: $("#password"),
  colorField: $("#colorField"),
  signupColorPicker: $("#signupColorPicker"),
  authSubmit: $("#authSubmit"),
  resetPasswordButton: $("#resetPasswordButton"),
  authMessage: $("#authMessage"),
  demoNotice: $("#demoNotice"),
  enterDemoButton: $("#enterDemoButton"),
  appName: $("#appName"),
  teamName: $("#teamName"),
  todayButton: $("#todayButton"),
  prevMonthButton: $("#prevMonthButton"),
  nextMonthButton: $("#nextMonthButton"),
  currentMonthLabel: $("#currentMonthLabel"),
  searchInput: $("#searchInput"),
  addEventButton: $("#addEventButton"),
  installAppButton: $("#installAppButton"),
  userMenuButton: $("#userMenuButton"),
  userMenuPanel: $("#userMenuPanel"),
  userAvatar: $("#userAvatar"),
  userName: $("#userName"),
  editProfileButton: $("#editProfileButton"),
  logoutButton: $("#logoutButton"),
  sidebar: $("#sidebar"),
  sidebarToggle: $("#sidebarToggle"),
  mobileSidebarClose: $("#mobileSidebarClose"),
  miniMonthLabel: $("#miniMonthLabel"),
  miniPrevButton: $("#miniPrevButton"),
  miniNextButton: $("#miniNextButton"),
  miniCalendar: $("#miniCalendar"),
  memberFilters: $("#memberFilters"),
  selectAllMembersButton: $("#selectAllMembersButton"),
  upcomingList: $("#upcomingList"),
  upcomingCount: $("#upcomingCount"),
  syncStatus: $("#syncStatus"),
  mobileTodayButton: $("#mobileTodayButton"),
  mobilePrevButton: $("#mobilePrevButton"),
  mobileNextButton: $("#mobileNextButton"),
  mobileMonthLabel: $("#mobileMonthLabel"),
  calendarGrid: $("#calendarGrid"),
  modalBackdrop: $("#modalBackdrop"),
  eventModal: $("#eventModal"),
  eventForm: $("#eventForm"),
  eventModalTitle: $("#eventModalTitle"),
  eventModalClose: $("#eventModalClose"),
  eventId: $("#eventId"),
  eventTitle: $("#eventTitle"),
  eventMember: $("#eventMember"),
  eventCategory: $("#eventCategory"),
  startDate: $("#startDate"),
  endDate: $("#endDate"),
  allDay: $("#allDay"),
  timeFields: $("#timeFields"),
  startTime: $("#startTime"),
  endTime: $("#endTime"),
  eventLocation: $("#eventLocation"),
  eventNotes: $("#eventNotes"),
  deleteEventButton: $("#deleteEventButton"),
  eventCancelButton: $("#eventCancelButton"),
  eventSaveButton: $("#eventSaveButton"),
  eventFormMessage: $("#eventFormMessage"),
  profileModal: $("#profileModal"),
  profileForm: $("#profileForm"),
  profileModalClose: $("#profileModalClose"),
  profileName: $("#profileName"),
  profileColorPicker: $("#profileColorPicker"),
  profileCancelButton: $("#profileCancelButton"),
  profileFormMessage: $("#profileFormMessage"),
  toastRegion: $("#toastRegion")
};

const today = startOfDay(new Date());
const state = {
  authMode: "login",
  demoMode: false,
  user: null,
  profile: null,
  profiles: [],
  events: [],
  holidays: [],
  currentMonth: new Date(today.getFullYear(), today.getMonth(), 1),
  miniMonth: new Date(today.getFullYear(), today.getMonth(), 1),
  selectedDate: toDateString(today),
  selectedMembers: new Set(),
  searchTerm: "",
  signupColor: COLOR_PALETTE[0],
  profileColor: COLOR_PALETTE[0],
  realtimeChannels: [],
  deferredInstallPrompt: null
};

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateString(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function sameDate(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(date);
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", weekday: "short" })
    .format(fromDateString(value));
}

function escapeText(value) {
  return String(value ?? "");
}

function getInitials(name) {
  const cleaned = String(name || "팀").trim();
  return cleaned.slice(0, 2) || "팀";
}

function profileById(id) {
  return state.profiles.find((profile) => String(profile.id) === String(id));
}

function getEventProfile(event) {
  return event.profiles || profileById(event.member_id) || {
    id: event.member_id,
    display_name: "담당",
    color: event.color || "#51647E"
  };
}

function showAuthMessage(message, type = "error") {
  elements.authMessage.textContent = message || "";
  elements.authMessage.classList.toggle("success", type === "success");
}

function showEventMessage(message, type = "error") {
  elements.eventFormMessage.textContent = message || "";
  elements.eventFormMessage.classList.toggle("success", type === "success");
}

function showProfileMessage(message, type = "error") {
  elements.profileFormMessage.textContent = message || "";
  elements.profileFormMessage.classList.toggle("success", type === "success");
}

function toast(title, message = "", type = "success") {
  const item = document.createElement("div");
  item.className = `toast${type === "error" ? " is-error" : ""}`;

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.textContent = type === "error" ? "!" : "✓";

  const body = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = title;
  const detail = document.createElement("span");
  detail.textContent = message;
  body.append(strong, detail);
  item.append(icon, body);
  elements.toastRegion.append(item);

  window.setTimeout(() => item.remove(), 3800);
}

function setBusy(button, busy, busyText = "처리 중…") {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function setSyncStatus(status, message) {
  elements.syncStatus.classList.remove("is-online", "is-offline");
  if (status === "online") elements.syncStatus.classList.add("is-online");
  if (status === "offline") elements.syncStatus.classList.add("is-offline");
  elements.syncStatus.querySelector("span:last-child").textContent = message;
}

function renderColorPicker(container, selected, onSelect) {
  container.innerHTML = "";
  COLOR_PALETTE.forEach((color, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `color-option${selected === color ? " is-selected" : ""}`;
    button.style.setProperty("--swatch", color);
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selected === color));
    button.setAttribute("aria-label", `색상 ${index + 1}`);
    const hidden = document.createElement("span");
    hidden.textContent = color;
    button.append(hidden);
    button.addEventListener("click", () => onSelect(color));
    container.append(button);
  });
}

function updateAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";
  elements.loginTab.classList.toggle("is-active", !isSignup);
  elements.signupTab.classList.toggle("is-active", isSignup);
  elements.loginTab.setAttribute("aria-selected", String(!isSignup));
  elements.signupTab.setAttribute("aria-selected", String(isSignup));
  elements.nameField.classList.toggle("is-hidden", !isSignup);
  elements.colorField.classList.add("is-hidden");
  elements.displayName.disabled = !isSignup;
  elements.displayName.required = isSignup;
  elements.password.autocomplete = isSignup ? "new-password" : "current-password";
  elements.authSubmit.textContent = isSignup ? "팀원 등록" : "로그인";
  elements.resetPasswordButton.classList.toggle("is-hidden", isSignup);
  showAuthMessage("");
}

function showAuthView() {
  elements.calendarView.classList.add("is-hidden");
  elements.authView.classList.remove("is-hidden");
  document.title = config.APP_NAME;
}

function showCalendarView() {
  elements.authView.classList.add("is-hidden");
  elements.calendarView.classList.remove("is-hidden");
  elements.appName.textContent = config.APP_NAME;
  elements.teamName.textContent = state.demoMode ? `${config.TEAM_NAME} · 데모` : config.TEAM_NAME;
  document.title = config.APP_NAME;
  updateCurrentUserUI();
  renderAll();
}

function updateCurrentUserUI() {
  const profile = state.profile || {
    display_name: "담당",
    full_name: "",
    color: COLOR_PALETTE[0]
  };

  const label = profile.full_name
    ? `${profile.display_name} · ${profile.full_name}`
    : profile.display_name;

  elements.userName.textContent = label;
  elements.userAvatar.textContent = getInitials(profile.display_name);
  elements.userAvatar.style.background = `${profile.color}1f`;
  elements.userAvatar.style.color = profile.color;
}

function visibleEvents() {
  const term = state.searchTerm.trim().toLocaleLowerCase("ko-KR");
  return state.events.filter((event) => {
    const memberMatch = state.selectedMembers.size === 0 || state.selectedMembers.has(String(event.member_id));
    if (!memberMatch) return false;
    if (!term) return true;
    const haystack = [event.title, event.category, event.location, event.notes, getEventProfile(event).display_name]
      .join(" ")
      .toLocaleLowerCase("ko-KR");
    return haystack.includes(term);
  });
}

function eventsOnDate(dateString) {
  return visibleEvents()
    .filter((event) => event.start_date <= dateString && event.end_date >= dateString)
    .sort((a, b) => {
      if (a.all_day !== b.all_day) return a.all_day ? -1 : 1;
      const timeCompare = String(a.start_time || "00:00").localeCompare(String(b.start_time || "00:00"));
      if (timeCompare !== 0) return timeCompare;
      return String(a.title).localeCompare(String(b.title), "ko-KR");
    });
}

function renderAll() {
  renderHeader();
  renderMiniCalendar();
  renderMemberFilters();
  renderMemberOptions();
  renderCalendar();
  renderUpcoming();
}

function renderHeader() {
  const label = formatMonth(state.currentMonth);
  elements.currentMonthLabel.textContent = label;
  elements.mobileMonthLabel.textContent = label;
}

function renderMiniCalendar() {
  elements.miniMonthLabel.textContent = formatMonth(state.miniMonth);
  elements.miniCalendar.innerHTML = "";
  ["일", "월", "화", "수", "목", "금", "토"].forEach((day) => {
    const weekday = document.createElement("div");
    weekday.className = "mini-weekday";
    weekday.textContent = day;
    elements.miniCalendar.append(weekday);
  });

  const first = new Date(state.miniMonth.getFullYear(), state.miniMonth.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-day";
    button.textContent = String(date.getDate());
    if (date.getMonth() !== state.miniMonth.getMonth()) button.classList.add("is-outside");
    if (sameDate(date, today)) button.classList.add("is-today");
    if (toDateString(date) === state.selectedDate) button.classList.add("is-selected");
    button.setAttribute("aria-label", `${toDateString(date)} 선택`);
    button.addEventListener("click", () => {
      state.selectedDate = toDateString(date);
      state.currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      state.miniMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      renderAll();
    });
    elements.miniCalendar.append(button);
  }
}

function renderMemberFilters() {
  elements.memberFilters.innerHTML = "";
  const monthPrefix = `${state.currentMonth.getFullYear()}-${String(state.currentMonth.getMonth() + 1).padStart(2, "0")}`;

  state.profiles.forEach((profile) => {
    const row = document.createElement("label");
    row.className = "member-filter";
    row.style.setProperty("--member-color", profile.color);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedMembers.size === 0 || state.selectedMembers.has(String(profile.id));
    checkbox.addEventListener("change", () => {
      if (state.selectedMembers.size === 0) {
        state.profiles.forEach((item) => state.selectedMembers.add(String(item.id)));
      }
      if (checkbox.checked) state.selectedMembers.add(String(profile.id));
      else state.selectedMembers.delete(String(profile.id));
      if (state.selectedMembers.size === state.profiles.length) state.selectedMembers.clear();
      renderMemberFilters();
      renderCalendar();
      renderUpcoming();
    });

    const label = document.createElement("span");
    label.className = "member-filter-label";
    label.textContent = profile.display_name;

    const count = document.createElement("span");
    count.className = "member-filter-count";
    count.textContent = String(state.events.filter((event) =>
      String(event.member_id) === String(profile.id) &&
      (event.start_date.startsWith(monthPrefix) || event.end_date.startsWith(monthPrefix) ||
        (event.start_date < `${monthPrefix}-01` && event.end_date > `${monthPrefix}-31`))
    ).length);

    row.append(checkbox, label, count);
    elements.memberFilters.append(row);
  });

  if (state.profiles.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "등록된 팀원이 없습니다.";
    elements.memberFilters.append(empty);
  }

  elements.selectAllMembersButton.textContent = state.selectedMembers.size === 0 ? "전체 선택됨" : "전체";
}

function renderMemberOptions() {
  const selected = elements.eventMember.value || state.profile?.id || "";
  elements.eventMember.innerHTML = "";
  state.profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.display_name;
    elements.eventMember.append(option);
  });
  if (state.profiles.some((profile) => String(profile.id) === String(selected))) {
    elements.eventMember.value = selected;
  }
}

function renderCalendar() {
  elements.calendarGrid.innerHTML = "";
  const firstOfMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    const dateString = toDateString(date);
    const dayEvents = eventsOnDate(dateString);
    const holiday = state.holidays.find((item) => item.date === dateString);
    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `${dateString}, 일정 ${dayEvents.length}개`);
    if (date.getMonth() !== state.currentMonth.getMonth()) cell.classList.add("is-outside");
    if (sameDate(date, today)) cell.classList.add("is-today");
    if (date.getDay() === 0) cell.classList.add("is-sunday");
    if (date.getDay() === 6) cell.classList.add("is-saturday");
    if (holiday) cell.classList.add("is-holiday");
    if (dateString === state.selectedDate) cell.classList.add("is-selected");

    const header = document.createElement("div");
    header.className = "day-header";
    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = String(date.getDate());
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "day-add";
    addButton.textContent = "+";
    addButton.setAttribute("aria-label", `${dateString} 일정 추가`);
    addButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openNewEvent(dateString);
    });
    header.append(number, addButton);

    const eventsContainer = document.createElement("div");
eventsContainer.className = "day-events";

if (holiday) {
  const holidayChip = document.createElement("div");
  holidayChip.className = "holiday-chip";
  holidayChip.textContent = holiday.name;
  holidayChip.setAttribute("aria-label", `공휴일 ${holiday.name}`);
  eventsContainer.append(holidayChip);
}

const maxVisible = holiday ? 2 : 3;
    dayEvents.slice(0, maxVisible).forEach((event) => {
      eventsContainer.append(createEventChip(event, dateString));
    });
    if (dayEvents.length > maxVisible) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "more-events";
      more.textContent = `+${dayEvents.length - maxVisible}개 더보기`;
      more.addEventListener("click", (clickEvent) => {
        clickEvent.stopPropagation();
        const titles = dayEvents.map((item) => {
          const profile = getEventProfile(item);
          const time = item.all_day ? "종일" : String(item.start_time || "").slice(0, 5);
          return `• ${time} ${item.title} (${profile.display_name})`;
        }).join("\n");
        window.alert(`${formatShortDate(dateString)} 일정\n\n${titles}`);
      });
      eventsContainer.append(more);
    }

    cell.append(header, eventsContainer);
    cell.addEventListener("click", () => {
      state.selectedDate = dateString;
      renderMiniCalendar();
      renderCalendar();
      openNewEvent(dateString);
    });
    elements.calendarGrid.append(cell);
  }
}

function createEventChip(event, dateString) {
  const profile = getEventProfile(event);
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "event-chip";
  chip.style.setProperty("--event-color", profile.color || event.color || COLOR_PALETTE[0]);
  chip.setAttribute("aria-label", `${event.title}, ${profile.display_name}, ${dateString}`);

  const dot = document.createElement("span");
  dot.className = "event-dot";
  const time = document.createElement("span");
  time.className = "event-time";
  time.textContent = event.all_day ? "종일" : String(event.start_time || "").slice(0, 5);
  const title = document.createElement("span");
  title.className = "event-title";
  title.textContent = `${event.title} (${profile.display_name})`;
  
  chip.append(dot, time, title);
  chip.addEventListener("click", (clickEvent) => {
    clickEvent.stopPropagation();
    openExistingEvent(event);
  });
  return chip;
}

function renderUpcoming() {
  const todayString = toDateString(today);
  const future = visibleEvents()
    .filter((event) => event.end_date >= todayString)
    .sort((a, b) => `${a.start_date} ${a.start_time || "00:00"}`.localeCompare(`${b.start_date} ${b.start_time || "00:00"}`))
    .slice(0, 6);

  elements.upcomingList.innerHTML = "";
  elements.upcomingCount.textContent = String(future.length);

  future.forEach((event) => {
    const profile = getEventProfile(event);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upcoming-item";
    button.style.setProperty("--event-color", profile.color);

    const bar = document.createElement("span");
    bar.className = "upcoming-bar";
    const content = document.createElement("span");
    content.className = "upcoming-content";
    const title = document.createElement("span");
    title.className = "upcoming-title";
    title.textContent = event.title;
    const meta = document.createElement("span");
    meta.className = "upcoming-meta";
    meta.textContent = `${formatShortDate(event.start_date)} · ${event.all_day ? "종일" : String(event.start_time).slice(0, 5)} · ${profile.display_name}`;
    content.append(title, meta);
    button.append(bar, content);
    button.addEventListener("click", () => openExistingEvent(event));
    elements.upcomingList.append(button);
  });

  if (future.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.searchTerm ? "검색 조건에 맞는 일정이 없습니다." : "다가오는 일정이 없습니다.";
    elements.upcomingList.append(empty);
  }
}

function openNewEvent(dateString = state.selectedDate) {
  showEventMessage("");
  elements.eventForm.reset();
  elements.eventId.value = "";
  elements.eventModalTitle.textContent = "일정 추가";
  elements.deleteEventButton.classList.add("is-hidden");
  elements.startDate.value = dateString;
  elements.endDate.value = dateString;
  elements.allDay.checked = true;
  elements.startTime.value = "09:00";
  elements.endTime.value = "10:00";
  elements.timeFields.classList.add("is-hidden");
  renderMemberOptions();
  if (state.profile?.id) elements.eventMember.value = state.profile.id;
  openModal(elements.eventModal);
  window.setTimeout(() => elements.eventTitle.focus(), 20);
}

function openExistingEvent(event) {
  showEventMessage("");
  elements.eventId.value = event.id;
  elements.eventModalTitle.textContent = "일정 상세·수정";
  elements.deleteEventButton.classList.remove("is-hidden");
  elements.eventTitle.value = event.title || "";
  renderMemberOptions();
  elements.eventMember.value = event.member_id;
  elements.eventCategory.value = event.category || "업무";
  elements.startDate.value = event.start_date;
  elements.endDate.value = event.end_date;
  elements.allDay.checked = Boolean(event.all_day);
  elements.startTime.value = String(event.start_time || "09:00").slice(0, 5);
  elements.endTime.value = String(event.end_time || "10:00").slice(0, 5);
  elements.timeFields.classList.toggle("is-hidden", Boolean(event.all_day));
  elements.eventLocation.value = event.location || "";
  elements.eventNotes.value = event.notes || "";
  openModal(elements.eventModal);
  window.setTimeout(() => elements.eventTitle.focus(), 20);
}

function openProfileModal() {
  elements.userMenuPanel.classList.add("is-hidden");
  elements.userMenuButton.setAttribute("aria-expanded", "false");
  showProfileMessage("");

  elements.profileName.value = state.profile?.full_name || "";
  state.profileColor = state.profile?.color || COLOR_PALETTE[0];

  openModal(elements.profileModal);
  window.setTimeout(() => elements.profileName.focus(), 20);
}

function openModal(modal) {
  elements.modalBackdrop.classList.remove("is-hidden");
  elements.modalBackdrop.setAttribute("aria-hidden", "false");
  modal.classList.remove("is-hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.add("is-hidden");
  if (elements.eventModal.classList.contains("is-hidden") && elements.profileModal.classList.contains("is-hidden")) {
    elements.modalBackdrop.classList.add("is-hidden");
    elements.modalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

function eventFormPayload() {
  return {
    title: elements.eventTitle.value.trim(),
    member_id: elements.eventMember.value,
    category: elements.eventCategory.value,
    start_date: elements.startDate.value,
    end_date: elements.endDate.value,
    all_day: elements.allDay.checked,
    start_time: elements.allDay.checked ? null : elements.startTime.value,
    end_time: elements.allDay.checked ? null : elements.endTime.value,
    location: elements.eventLocation.value.trim() || null,
    notes: elements.eventNotes.value.trim() || null,
    color: profileById(elements.eventMember.value)?.color || COLOR_PALETTE[0],
    updated_at: new Date().toISOString()
  };
}

function validateEvent(payload) {
  if (!payload.title) return "일정 제목을 입력해주세요.";
  if (!payload.member_id) return "담당 구분을 선택해주세요.";
  if (!payload.start_date || !payload.end_date) return "시작일과 종료일을 입력해주세요.";
  if (payload.end_date < payload.start_date) return "종료일은 시작일보다 빠를 수 없습니다.";
  if (!payload.all_day && !payload.start_time) return "시작 시간을 입력해주세요.";
  if (!payload.all_day && !payload.end_time) return "종료 시간을 입력해주세요.";
  if (!payload.all_day && payload.start_date === payload.end_date && payload.end_time <= payload.start_time) {
    return "같은 날 일정은 종료 시간이 시작 시간보다 늦어야 합니다.";
  }
  return "";
}

function demoStorageKey() {
  return "team-calendar-demo-events-v1";
}

function loadDemoEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(demoStorageKey()) || "null");
    if (Array.isArray(stored)) return stored;
  } catch (error) {
    console.warn("데모 일정 불러오기 실패", error);
  }

  const base = new Date();
  const role = (name) => DEMO_PROFILES.find((item) => item.display_name === name);
  const sample = [
    {
      id: `demo-event-${Date.now()}-1`, title: "주간 업무회의", member_id: role("팀장").id, category: "회의",
      start_date: toDateString(addDays(base, 1)), end_date: toDateString(addDays(base, 1)), all_day: false,
      start_time: "10:00", end_time: "11:00", location: "회의실", notes: "주요 현안 및 주간 계획 공유", color: ROLE_COLOR["팀장"]
    },
    {
      id: `demo-event-${Date.now()}-2`, title: "인사자료 정리", member_id: role("인사").id, category: "업무",
      start_date: toDateString(addDays(base, 2)), end_date: toDateString(addDays(base, 2)), all_day: true,
      start_time: null, end_time: null, location: null, notes: null, color: ROLE_COLOR["인사"]
    },
    {
      id: `demo-event-${Date.now()}-3`, title: "복무 점검", member_id: role("감찰").id, category: "업무",
      start_date: toDateString(addDays(base, 3)), end_date: toDateString(addDays(base, 3)), all_day: false,
      start_time: "14:00", end_time: "16:00", location: "청사", notes: null, color: ROLE_COLOR["감찰"]
    },
    {
      id: `demo-event-${Date.now()}-4`, title: "직무 교육", member_id: role("교육").id, category: "교육",
      start_date: toDateString(addDays(base, 5)), end_date: toDateString(addDays(base, 5)), all_day: false,
      start_time: "09:30", end_time: "11:30", location: "교육장", notes: null, color: ROLE_COLOR["교육"]
    },
    {
      id: `demo-event-${Date.now()}-5`, title: "안전 점검", member_id: role("안전").id, category: "업무",
      start_date: toDateString(addDays(base, 6)), end_date: toDateString(addDays(base, 6)), all_day: true,
      start_time: null, end_time: null, location: "청사 전반", notes: null, color: ROLE_COLOR["안전"]
    }
  ];
  localStorage.setItem(demoStorageKey(), JSON.stringify(sample));
  return sample;
}

function saveDemoEvents() {
  localStorage.setItem(demoStorageKey(), JSON.stringify(state.events));
}

async function saveEvent(event) {
  event.preventDefault();
  showEventMessage("");
  const payload = eventFormPayload();
  const validation = validateEvent(payload);
  if (validation) {
    showEventMessage(validation);
    return;
  }

  const existingId = elements.eventId.value;
  setBusy(elements.eventSaveButton, true, "저장 중…");
  try {
    if (state.demoMode) {
      if (existingId) {
        state.events = state.events.map((item) => String(item.id) === String(existingId) ? { ...item, ...payload } : item);
      } else {
        state.events.push({
          ...payload,
          id: `demo-event-${Date.now()}`,
          created_by: state.user.id,
          created_at: new Date().toISOString()
        });
      }
      saveDemoEvents();
      renderAll();
      closeModal(elements.eventModal);
      toast(existingId ? "일정을 수정했습니다" : "일정을 추가했습니다", "팀 캘린더에 반영되었습니다.");
      return;
    }

    if (existingId) {
      const { error } = await supabase.from("events").update(payload).eq("id", existingId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("events").insert({
        ...payload,
        created_by: state.user.id
      });
      if (error) throw error;
    }

    await loadEvents();
    renderAll();
    closeModal(elements.eventModal);
    toast(existingId ? "일정을 수정했습니다" : "일정을 추가했습니다", "모든 팀원의 화면에 동기화됩니다.");
  } catch (error) {
    console.error(error);
    showEventMessage(humanizeError(error, "일정을 저장하지 못했습니다."));
  } finally {
    setBusy(elements.eventSaveButton, false);
  }
}

async function deleteEvent() {
  const eventId = elements.eventId.value;
  if (!eventId) return;
  if (!window.confirm("이 일정을 삭제할까요? 팀원 화면에서도 사라집니다.")) return;

  setBusy(elements.deleteEventButton, true, "삭제 중…");
  try {
    if (state.demoMode) {
      state.events = state.events.filter((item) => String(item.id) !== String(eventId));
      saveDemoEvents();
    } else {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
      await loadEvents();
    }
    renderAll();
    closeModal(elements.eventModal);
    toast("일정을 삭제했습니다", "변경 내용이 반영되었습니다.");
  } catch (error) {
    console.error(error);
    showEventMessage(humanizeError(error, "일정을 삭제하지 못했습니다."));
  } finally {
    setBusy(elements.deleteEventButton, false);
  }
}

function humanizeError(error, fallback) {
  const message = String(error?.message || "");
  if (/Invalid login credentials/i.test(message)) return "이메일 또는 비밀번호가 맞지 않습니다.";
  if (/Email not confirmed/i.test(message)) return "이메일 인증을 완료한 뒤 로그인해주세요.";
  if (/User already registered/i.test(message)) return "이미 등록된 이메일입니다.";
  if (/duplicate key|unique constraint/i.test(message)) return "이미 등록된 담당입니다. 기존 담당 계정으로 로그인해주세요.";
  if (/Password should be/i.test(message)) return "비밀번호는 6자 이상으로 입력해주세요.";
  if (/Failed to fetch|NetworkError/i.test(message)) return "인터넷 연결 또는 Supabase 설정을 확인해주세요.";
  if (/row-level security/i.test(message)) return "데이터 권한 설정(RLS)을 확인해주세요.";
  return message || fallback;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  showAuthMessage("");
  if (!isSupabaseConfigured) {
    showAuthMessage("먼저 config.js에 Supabase 주소와 Publishable Key를 입력해주세요.");
    return;
  }

  const email = elements.email.value.trim();
  const password = elements.password.value;
  setBusy(elements.authSubmit, true, state.authMode === "signup" ? "등록 중…" : "로그인 중…");

  try {
    if (state.authMode === "signup") {
      const displayName = elements.displayName.value.trim();
      if (!ROLE_COLOR[displayName]) throw new Error("담당 구분을 선택해주세요.");
      const roleColor = ROLE_COLOR[displayName];
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName, color: roleColor }
        }
      });
      if (error) throw error;
      if (data.session) {
        showAuthMessage("팀원 등록이 완료되었습니다.", "success");
      } else {
        showAuthMessage("인증 메일을 보냈습니다. 메일의 확인 링크를 누른 뒤 로그인해주세요.", "success");
        updateAuthMode("login");
  updateInstallButton();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  } catch (error) {
    console.error(error);
    showAuthMessage(humanizeError(error, "로그인 처리 중 오류가 발생했습니다."));
  } finally {
    setBusy(elements.authSubmit, false);
  }
}

async function sendPasswordReset() {
  const email = elements.email.value.trim();
  if (!email) {
    showAuthMessage("비밀번호를 재설정할 이메일을 입력해주세요.");
    elements.email.focus();
    return;
  }
  if (!isSupabaseConfigured) {
    showAuthMessage("먼저 Supabase 설정을 완료해주세요.");
    return;
  }
  setBusy(elements.resetPasswordButton, true, "메일 전송 중…");
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) throw error;
    showAuthMessage("비밀번호 재설정 메일을 보냈습니다.", "success");
  } catch (error) {
    showAuthMessage(humanizeError(error, "재설정 메일을 보내지 못했습니다."));
  } finally {
    setBusy(elements.resetPasswordButton, false);
  }
}

async function loadProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, full_name, color, created_at")
    .order("display_name", { ascending: true });
  if (error) throw error;
  state.profiles = data || [];

  state.profile = state.profiles.find((profile) => profile.id === state.user.id) || null;
  if (!state.profile) {
    const metadata = state.user.user_metadata || {};
    const fallback = {
      id: state.user.id,
      display_name: metadata.display_name || state.user.email?.split("@")[0] || "팀원",
      color: metadata.color || COLOR_PALETTE[0]
    };
    const { error: upsertError } = await supabase.from("profiles").upsert(fallback);
    if (upsertError) throw upsertError;
    state.profiles.push(fallback);
    state.profile = fallback;
  }
}

async function loadEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, member_id, category, start_date, end_date, all_day, start_time, end_time, location, notes, color, created_by, created_at, updated_at, profiles:profiles!events_member_id_fkey(id, display_name, full_name, color)")
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });
  if (error) throw error;
  state.events = data || [];
}
async function loadHolidays() {
  if (!supabase || state.demoMode) {
    state.holidays = [];
    return;
  }

  const year = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth() + 1;

  const { data, error } = await supabase.functions.invoke("korea-holidays", {
    body: { year, month }
  });

  if (error) throw error;

  state.holidays = Array.isArray(data?.holidays)
    ? data.holidays
    : [];
}
async function enterLiveApp(session) {
  state.demoMode = false;
  state.user = session.user;
  setSyncStatus("", "일정 불러오는 중");
  try {
    await Promise.all([loadProfiles(), loadEvents(), loadHolidays()]);
    state.selectedMembers.clear();
    showCalendarView();
    subscribeRealtime();
    setSyncStatus("online", "실시간 동기화 중");
  } catch (error) {
    console.error(error);
    showAuthView();
    showAuthMessage(humanizeError(error, "팀 일정을 불러오지 못했습니다."));
  }
}

function enterDemoApp() {
  state.demoMode = true;
  state.user = { id: "demo-1", email: "demo@example.com" };
  state.profiles = DEMO_PROFILES.map((item) => ({ ...item }));
  state.profile = state.profiles[0];
  state.events = loadDemoEvents();
  state.selectedMembers.clear();
  showCalendarView();
  setSyncStatus("offline", "데모: 이 기기에만 저장");
}

function unsubscribeRealtime() {
  if (!supabase) return;
  state.realtimeChannels.forEach((channel) => supabase.removeChannel(channel));
  state.realtimeChannels = [];
}

function subscribeRealtime() {
  unsubscribeRealtime();
  const eventsChannel = supabase
    .channel("team-calendar-events")
    .on("postgres_changes", { event: "*", schema: "public", table: "events" }, async () => {
      try {
        await loadEvents();
        renderCalendar();
        renderMemberFilters();
        renderUpcoming();
        setSyncStatus("online", "방금 동기화됨");
      } catch (error) {
        console.error(error);
        setSyncStatus("offline", "동기화 오류");
      }
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") setSyncStatus("online", "실시간 동기화 중");
      if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) setSyncStatus("offline", "연결 재시도 필요");
    });

  const profilesChannel = supabase
    .channel("team-calendar-profiles")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, async () => {
      try {
        await loadProfiles();
        renderMemberFilters();
        renderMemberOptions();
        updateCurrentUserUI();
        renderCalendar();
        renderUpcoming();
      } catch (error) {
        console.error(error);
      }
    })
    .subscribe();

  state.realtimeChannels.push(eventsChannel, profilesChannel);
}

async function saveProfile(event) {
  event.preventDefault();
  showProfileMessage("");

  const fullName = elements.profileName.value.trim();

  if (!fullName) {
    showProfileMessage("이름을 입력해주세요.");
    return;
  }

  if (fullName.length > 30) {
    showProfileMessage("이름은 30자 이내로 입력해주세요.");
    return;
  }

  const submitButton = elements.profileForm.querySelector('button[type="submit"]');
  setBusy(submitButton, true, "저장 중…");

  try {
    if (state.demoMode) {
      state.profile.full_name = fullName;
      state.profiles = state.profiles.map((profile) =>
        profile.id === state.profile.id ? { ...state.profile } : profile
      );
    } else {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", state.user.id);

      if (error) throw error;

      await loadProfiles();
    }

    updateCurrentUserUI();
    renderAll();
    closeModal(elements.profileModal);

    toast(
      "이름을 변경했습니다",
      `${state.profile?.display_name || "담당"} 담당은 그대로 유지됩니다.`
    );
  } catch (error) {
    console.error(error);
    showProfileMessage(
      humanizeError(error, "이름을 변경하지 못했습니다.")
    );
  } finally {
    setBusy(submitButton, false);
  }
}

async function logout() {
  elements.userMenuPanel.classList.add("is-hidden");
  if (state.demoMode) {
    state.demoMode = false;
    state.user = null;
    showAuthView();
    return;
  }
  unsubscribeRealtime();
  const { error } = await supabase.auth.signOut();
  if (error) toast("로그아웃 실패", error.message, "error");
}

async function shiftCurrentMonth(amount) {
  state.currentMonth = addMonths(state.currentMonth, amount);
  state.miniMonth = new Date(state.currentMonth);

  try {
    await loadHolidays();
  } catch (error) {
    console.error("공휴일 조회 실패:", error);
    state.holidays = [];
  }

  renderAll();
  elements.currentMonthLabel.focus({ preventScroll: true });
}

async function goToday() {
  state.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  state.miniMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  state.selectedDate = toDateString(today);

  try {
    await loadHolidays();
  } catch (error) {
    console.error("공휴일 조회 실패:", error);
    state.holidays = [];
  }

  renderAll();
}

function toggleSidebar(open) {
  elements.sidebar.classList.toggle("is-open", open);
  elements.sidebarToggle.setAttribute("aria-expanded", String(open));
  elements.modalBackdrop.classList.toggle("is-hidden", !open);
  elements.modalBackdrop.setAttribute("aria-hidden", String(!open));
}


function isStandaloneMode() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

function updateInstallButton() {
  if (!elements.installAppButton) return;
  if (isStandaloneMode()) {
    elements.installAppButton.classList.add("is-hidden");
    return;
  }
  elements.installAppButton.classList.remove("is-hidden");
}

async function installApp() {
  if (state.deferredInstallPrompt) {
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    updateInstallButton();
    return;
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    window.alert("iPhone/iPad: Safari의 공유 버튼(□↑) → ‘홈 화면에 추가’를 누르세요.");
  } else {
    window.alert("브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택하세요.");
  }
}

function bindEvents() {
  elements.loginTab.addEventListener("click", () => updateAuthMode("login"));
  elements.signupTab.addEventListener("click", () => updateAuthMode("signup"));
  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.resetPasswordButton.addEventListener("click", sendPasswordReset);
  elements.enterDemoButton.addEventListener("click", enterDemoApp);

  elements.todayButton.addEventListener("click", goToday);
  elements.mobileTodayButton.addEventListener("click", goToday);
  elements.prevMonthButton.addEventListener("click", () => shiftCurrentMonth(-1));
  elements.mobilePrevButton.addEventListener("click", () => shiftCurrentMonth(-1));
  elements.nextMonthButton.addEventListener("click", () => shiftCurrentMonth(1));
  elements.mobileNextButton.addEventListener("click", () => shiftCurrentMonth(1));
  elements.miniPrevButton.addEventListener("click", () => {
    state.miniMonth = addMonths(state.miniMonth, -1);
    renderMiniCalendar();
  });
  elements.miniNextButton.addEventListener("click", () => {
    state.miniMonth = addMonths(state.miniMonth, 1);
    renderMiniCalendar();
  });

  elements.searchInput.addEventListener("input", () => {
    state.searchTerm = elements.searchInput.value;
    renderCalendar();
    renderUpcoming();
  });
  elements.addEventButton.addEventListener("click", () => openNewEvent(state.selectedDate));
  elements.installAppButton?.addEventListener("click", installApp);
  elements.selectAllMembersButton.addEventListener("click", () => {
    state.selectedMembers.clear();
    renderMemberFilters();
    renderCalendar();
    renderUpcoming();
  });

  elements.userMenuButton.addEventListener("click", () => {
    const isOpen = !elements.userMenuPanel.classList.contains("is-hidden");
    elements.userMenuPanel.classList.toggle("is-hidden", isOpen);
    elements.userMenuButton.setAttribute("aria-expanded", String(!isOpen));
  });
  elements.editProfileButton.addEventListener("click", openProfileModal);
  elements.logoutButton.addEventListener("click", logout);

  elements.sidebarToggle.addEventListener("click", () => toggleSidebar(true));
  elements.mobileSidebarClose.addEventListener("click", () => toggleSidebar(false));

  elements.allDay.addEventListener("change", () => {
    elements.timeFields.classList.toggle("is-hidden", elements.allDay.checked);
  });
  elements.startDate.addEventListener("change", () => {
    if (!elements.endDate.value || elements.endDate.value < elements.startDate.value) {
      elements.endDate.value = elements.startDate.value;
    }
  });
  elements.eventForm.addEventListener("submit", saveEvent);
  elements.deleteEventButton.addEventListener("click", deleteEvent);
  elements.eventModalClose.addEventListener("click", () => closeModal(elements.eventModal));
  elements.eventCancelButton.addEventListener("click", () => closeModal(elements.eventModal));

  elements.profileForm.addEventListener("submit", saveProfile);
  elements.profileModalClose.addEventListener("click", () => closeModal(elements.profileModal));
  elements.profileCancelButton.addEventListener("click", () => closeModal(elements.profileModal));

  elements.modalBackdrop.addEventListener("click", () => {
    if (elements.sidebar.classList.contains("is-open")) {
      toggleSidebar(false);
      return;
    }
    closeModal(elements.eventModal);
    closeModal(elements.profileModal);
  });

  document.addEventListener("click", (event) => {
    if (!elements.userMenuButton.contains(event.target) && !elements.userMenuPanel.contains(event.target)) {
      elements.userMenuPanel.classList.add("is-hidden");
      elements.userMenuButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (elements.sidebar.classList.contains("is-open")) toggleSidebar(false);
      closeModal(elements.eventModal);
      closeModal(elements.profileModal);
    }
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    updateInstallButton();
  });
  window.addEventListener("appinstalled", () => {
    state.deferredInstallPrompt = null;
    updateInstallButton();
    toast("앱 설치 완료", "홈 화면에서 바로 실행할 수 있습니다.");
  });

  window.addEventListener("online", () => {
    if (!state.demoMode && state.user) setSyncStatus("online", "인터넷 연결됨");
  });
  window.addEventListener("offline", () => {
    if (!state.demoMode && state.user) setSyncStatus("offline", "인터넷 연결 끊김");
  });
}

async function initialize() {
  elements.appName.textContent = config.APP_NAME;
  elements.teamName.textContent = config.TEAM_NAME;
  document.title = config.APP_NAME;


  if (!config.ALLOW_SIGN_UP) {
    elements.signupTab.classList.add("is-hidden");
  }
  if (!isSupabaseConfigured && config.ENABLE_DEMO) {
    elements.demoNotice.classList.remove("is-hidden");
  }

  bindEvents();
  updateAuthMode("login");

  if (!isSupabaseConfigured) {
    showAuthView();
    return;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    showAuthMessage(humanizeError(error, "로그인 상태를 확인하지 못했습니다."));
    return;
  }
  if (data.session) await enterLiveApp(data.session);
  else showAuthView();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      unsubscribeRealtime();
      state.user = null;
      state.profile = null;
      state.profiles = [];
      state.events = [];
      showAuthView();
      return;
    }
    if (event === "PASSWORD_RECOVERY") {
      const newPassword = window.prompt("새 비밀번호를 6자 이상 입력해주세요.");
      if (newPassword && newPassword.length >= 6) {
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) toast("비밀번호 변경 실패", updateError.message, "error");
        else toast("비밀번호를 변경했습니다", "새 비밀번호로 다음 로그인부터 이용하세요.");
      }
      return;
    }
    if (event === "SIGNED_IN" && state.user?.id !== session.user.id) {
      await enterLiveApp(session);
    }
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("서비스 워커 등록 실패", error);
    });
  });
}

initialize().catch((error) => {
  console.error(error);
  showAuthMessage("앱을 시작하지 못했습니다. config.js와 인터넷 연결을 확인해주세요.");
});
