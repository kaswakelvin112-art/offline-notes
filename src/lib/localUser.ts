// Every visitor — signed up or not — gets a stable local ID the moment
// they open the app. It's just a device/browser identifier, stored in
// localStorage, and every note/folder they create gets tagged with it.
//
// When they sign up, this is the ID your migration step (Step 3 in the
// plan) uses to find "everything this visitor made" and re-tag it with
// their real Supabase user.id.

const STORAGE_KEY = 'notes_local_user_id';

export function getLocalUserId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

// Call this once, right after a successful sign-up/sign-in, once you've
// migrated the visitor's local data to their real Supabase user_id. It
// stops treating the browser as an anonymous visitor going forward.
export function clearLocalUserId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
