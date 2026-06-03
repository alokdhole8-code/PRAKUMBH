export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("prakumbh_users")) || [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem("prakumbh_users", JSON.stringify(users));
}

export function register(name, email, password) {
  const users = getUsers();

  const user = {
    id: `u_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password,
    createdAt: new Date().toISOString(),
    orders: [],
  };

  users.push(user);
  saveUsers(users);

  const { password: _, ...safeUser } = user;
  localStorage.setItem(
    "prakumbh_current",
    JSON.stringify(safeUser)
  );

  return user;
}

export function login(email, password) {
  const users = getUsers();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
  );

  if (!user) return null;

  const { password: _, ...safeUser } = user;

  localStorage.setItem(
    "prakumbh_current",
    JSON.stringify(safeUser)
  );

  return safeUser;
}

export function logout() {
  localStorage.removeItem("prakumbh_current");
}

export function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem("prakumbh_current")
    );
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getUser();
}

export function getOrders() {
  const current = getUser();
  if (!current) return [];

  const users = getUsers();

  const fullUser = users.find(
    (u) => u.id === current.id
  );

  return fullUser?.orders || [];
}

export function saveOrder(order) {
  const current = getUser();
  if (!current) return false;

  const users = getUsers();

  const index = users.findIndex(
    (u) => u.id === current.id
  );

  if (index === -1) return false;

  if (!users[index].orders) {
    users[index].orders = [];
  }

  users[index].orders.unshift(order);

  saveUsers(users);

  return true;
}

export function updateUser(data) {
  const current = getUser();
  if (!current) return false;

  const users = getUsers();

  const index = users.findIndex(
    (u) => u.id === current.id
  );

  if (index === -1) return false;

  users[index] = {
    ...users[index],
    ...data,
  };

  saveUsers(users);

  const { password, ...safeUser } =
    users[index];

  localStorage.setItem(
    "prakumbh_current",
    JSON.stringify(safeUser)
  );

  return true;
}