export function translateRole(role: string): string {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'Tulajdonos';
    case 'member':
      return 'Tag';
    case 'invited':
      return 'Meghívott';
    case 'pending':
      return 'Függőben';
    case 'admin':
      return 'Admin';
    case 'guest':
      return 'Vendég';
    default:
      return role;
  }
}
