export const UserRole = Object.freeze({
  MANAGER: 'Manager',
  DIRECTOR: 'Director'
});

export class User {
  constructor({ id, name, role } = {}) {
    this.id = id;
    this.name = name;
    this.role = role;
  }
}
