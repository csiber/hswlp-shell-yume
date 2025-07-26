export function translateRole(role: string): string {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'Owner';
    case 'member':
      return 'Member';
    case 'invited':
      return 'Invited';
    case 'pending':
      return 'Pending';
    case 'admin':
      return 'Admin';
    case 'guest':
      return 'Guest';
    default:
      return role;
  }
}
