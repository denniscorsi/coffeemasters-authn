import API from './API.js';
import Router from './Router.js';

const Auth = {
  isLoggedIn: false,
  account: null,
  register: async (event) => {
    event.preventDefault();
    const user = {
      name: document.getElementById('register_name').value,
      email: document.getElementById('register_email').value,
      password: document.getElementById('register_password').value,
    };
    const response = await API.register(user);
    Auth.postLogin(response, user);
  },
  login: async (event) => {
    if (event) event.preventDefault();
    const credentials = {
      email: document.getElementById('login_email').value,
      password: document.getElementById('login_password').value,
    };
    const response = await API.login(credentials);
    Auth.postLogin(response, {
      ...credentials,
      name: response.name,
    });
  },
  async postLogin(response, user) {
    if (response.ok) {
      this.isLoggedIn = true;
      this.account = user;
      this.updateStatus();
      Router.go('/account');
    } else {
      alert(response.message);
    }

    // Check if correct API exists in this browser
    if (window.PasswordCredential && user.password) {
      const credentials = new PasswordCredential({
        id: user.email,
        password: user.password,
        name: user.name, // This one is optional. Will show up in password manager which can help if there are multiple users on this computer
      });
      await navigator.credentials.store(credentials);
    }
  },
  updateStatus() {
    if (Auth.isLoggedIn && Auth.account) {
      document
        .querySelectorAll('.logged_out')
        .forEach((e) => (e.style.display = 'none'));
      document
        .querySelectorAll('.logged_in')
        .forEach((e) => (e.style.display = 'block'));
      document
        .querySelectorAll('.account_name')
        .forEach((e) => (e.innerHTML = Auth.account.name));
      document
        .querySelectorAll('.account_username')
        .forEach((e) => (e.innerHTML = Auth.account.email));
    } else {
      document
        .querySelectorAll('.logged_out')
        .forEach((e) => (e.style.display = 'block'));
      document
        .querySelectorAll('.logged_in')
        .forEach((e) => (e.style.display = 'none'));
    }
  },
  autoLogin: async () => {
    if (window.PasswordCredential) {
      const credentials = await navigator.credentials.get({ password: true });
      console.log(credentials);
      document.getElementById('login_email').value = credentials.id;
      document.getElementById('login_password').value = credentials.password;
      Auth.login();
    }
  },
  logout() {
    Auth.account = null;
    Auth.isLoggedIn = false;
    this.updateStatus();
    Router.go('/');
    if (window.PasswordCredential) {
      navigator.credentials.preventSilentAccess();
    }
  },
  init: () => {},
};
Auth.updateStatus();
Auth.autoLogin();

export default Auth;

// make it a global object
window.Auth = Auth;
