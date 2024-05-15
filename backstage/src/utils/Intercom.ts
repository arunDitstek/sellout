// import IUser from '@sellout/models/.dist/interfaces/IUser';
// import IUserProfile from '@sellout/models/.dist/interfaces/IUserProfile';
// import IOrganization from '@sellout/models/.dist/interfaces/IOrganization';

// TODO: move this to common and determine when intercom should be enabled/disabled
const isProduction = () => {
  return true;
}

declare global {
  interface Window { Intercom: any; intercomSettings: any; }
};

window.Intercom = window.Intercom || {};
window.intercomSettings = window.intercomSettings || {};

function waitForIntercom() {
  return new Promise((resolve: any) => {
    const interval = setInterval(() => {
      if (window.Intercom) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

function userDetails(user: any = {}, userProfile: any = {}, organization: any = {}) {
  const name = Object.keys(user).length ? `${user?.firstName} ${user?.lastName}` : null;
  return {
    user_id: userProfile.userId,
    name,
    email: user ? user.email : null,
    phone: user ? user.phoneNumber : null,
    company: {
      id: organization._id,
      name: organization.orgName,
      created_at: organization.createdAt,
    },
  };
}

export function toggle() {
  if (isProduction()) {
    const intercomEl = document.getElementsByClassName('intercom-messenger-frame');
    if (intercomEl.length > 0) {
      window.Intercom('hide');
    } else {
      window.Intercom('show');
    }
  }
}

export function update(user: any, userProfile: any, organization: any) {
  if (isProduction()) {
    const details = userDetails(user, userProfile, organization);
    window.Intercom('update', details);
  }
}

export async function hideLauncher(isHidden: boolean) {
  if (isProduction()) {
    await waitForIntercom();
    window.intercomSettings = {
      app_id: 'ipcyncu9',
      hide_default_launcher: isHidden,
    };
    window.Intercom('update');
  }
};

export async function boot(user: any, userProfile: any, organization: any, hideLauncher = true) {
  if (isProduction()) {
    await waitForIntercom();
    const details = userDetails(user, userProfile, organization);
    window.intercomSettings = {
      app_id: 'ipcyncu9',
      hide_default_launcher: hideLauncher,
    };
    window.Intercom('boot', details);
  }
}

export function connect(user?: any, userProfile?: any, organization?: any, ...args: any) {
  if (isProduction()) {
    console.log('Intercom -- Initializing');
    const w = window;
    const ic = w.Intercom;

    window.intercomSettings = {
      app_id: 'ipcyncu9',
      hide_default_launcher: true,
      ...userDetails(user, userProfile, organization),
    };

    if (typeof ic === 'function') {
      ic('reattach_activator');
      ic('update', w.intercomSettings);
    } else {
      const d = document;
      const i: any = function () {
        i.c(args);
      };
      i.q = [] as any[];
      i.c = function (args: any) {
        i.q.push(args);
      };
      w.Intercom = i;
      const l = function () {
        const s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://widget.intercom.io/widget/ipcyncu9';
        const x = d.getElementsByTagName('script')[0];
        x?.parentNode?.insertBefore(s, x);
      };

      l();
    }
  } else {
    console.warn('Intercom - Is not production, skipping initialization...');
  }
}
