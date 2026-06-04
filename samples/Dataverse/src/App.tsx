import { Suspense, lazy, useEffect, useMemo, useState, type FormEvent } from 'react';
import './App.css';

const PowerAppsDataverseApp = lazy(() => import('./PowerAppsDataverseApp'));

function isPowerAppsRuntime() {
  if (typeof window === 'undefined') {
    return false;
  }

  const host = window.location.hostname.toLowerCase();
  return host.includes('powerapps.com') || host.includes('dynamics.com');
}

type DemoContact = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
};

type DemoAccount = {
  id: string;
  name: string;
  email: string;
  city: string;
};

const DEMO_CONTACTS_KEY = 'dataverse-demo-standalone-contacts';
const DEMO_ACCOUNTS_KEY = 'dataverse-demo-standalone-accounts';

const DEFAULT_CONTACTS: DemoContact[] = [
  { id: 'c1', fullName: 'Alex Morgan', email: 'alex.morgan@contoso.com', phone: '+1 (555) 010-1001' },
  { id: 'c2', fullName: 'Taylor Brown', email: 'taylor.brown@contoso.com', phone: '+1 (555) 010-1002' },
];

const DEFAULT_ACCOUNTS: DemoAccount[] = [
  { id: 'a1', name: 'Contoso Retail', email: 'ops@contoso-retail.com', city: 'Seattle' },
  { id: 'a2', name: 'Northwind Logistics', email: 'hello@northwindlogistics.com', city: 'Portland' },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function StandaloneStaticWebApp() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'accounts'>('contacts');

  const [contacts, setContacts] = useState<DemoContact[]>(() =>
    loadFromStorage(DEMO_CONTACTS_KEY, DEFAULT_CONTACTS)
  );
  const [accounts, setAccounts] = useState<DemoAccount[]>(() =>
    loadFromStorage(DEMO_ACCOUNTS_KEY, DEFAULT_ACCOUNTS)
  );

  const [contactForm, setContactForm] = useState({ id: '', fullName: '', email: '', phone: '' });
  const [accountForm, setAccountForm] = useState({ id: '', name: '', email: '', city: '' });

  useEffect(() => {
    saveToStorage(DEMO_CONTACTS_KEY, contacts);
  }, [contacts]);

  useEffect(() => {
    saveToStorage(DEMO_ACCOUNTS_KEY, accounts);
  }, [accounts]);

  const isEditingContact = useMemo(() => Boolean(contactForm.id), [contactForm.id]);
  const isEditingAccount = useMemo(() => Boolean(accountForm.id), [accountForm.id]);

  const resetContactForm = () => setContactForm({ id: '', fullName: '', email: '', phone: '' });
  const resetAccountForm = () => setAccountForm({ id: '', name: '', email: '', city: '' });

  const upsertContact = (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.fullName.trim()) return;

    if (contactForm.id) {
      setContacts((prev) =>
        prev.map((c) => (c.id === contactForm.id ? { ...c, ...contactForm, fullName: contactForm.fullName.trim() } : c))
      );
    } else {
      const newContact: DemoContact = {
        id: `c-${Date.now()}`,
        fullName: contactForm.fullName.trim(),
        email: contactForm.email.trim(),
        phone: contactForm.phone.trim(),
      };
      setContacts((prev) => [newContact, ...prev]);
    }

    resetContactForm();
  };

  const upsertAccount = (e: FormEvent) => {
    e.preventDefault();
    if (!accountForm.name.trim()) return;

    if (accountForm.id) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountForm.id ? { ...a, ...accountForm, name: accountForm.name.trim() } : a))
      );
    } else {
      const newAccount: DemoAccount = {
        id: `a-${Date.now()}`,
        name: accountForm.name.trim(),
        email: accountForm.email.trim(),
        city: accountForm.city.trim(),
      };
      setAccounts((prev) => [newAccount, ...prev]);
    }

    resetAccountForm();
  };

  return (
    <div className="app-container">
      <header>
        <h1>Dataverse Demo App</h1>
        <p>Standalone mode for Azure Static Web Apps with local demo CRUD</p>
      </header>

      <section className="tab-intro">
        <h3>Deployment Status</h3>
        <p>
          This build runs in standalone mode and stores demo data in localStorage.
          Your changes are persisted in this browser.
        </p>
      </section>

      <nav className="page-tabs">
        <button className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
          Demo Contacts
        </button>
        <button className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
          Demo Accounts
        </button>
      </nav>

      {activeTab === 'contacts' && (
        <div className="content-grid">
          <section className="contacts-list">
            <div className="section-header">
              <h2>Contacts</h2>
            </div>
            <div className="contacts-grid">
              {contacts.map((contact) => (
                <article className="contact-card" key={contact.id}>
                  <h3>{contact.fullName}</h3>
                  <p className="email">{contact.email || 'No email'}</p>
                  <p>{contact.phone || 'No phone'}</p>
                  <div className="card-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => setContactForm({
                        id: contact.id,
                        fullName: contact.fullName,
                        email: contact.email,
                        phone: contact.phone,
                      })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => setContacts((prev) => prev.filter((c) => c.id !== contact.id))}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="contact-form">
            <div className="section-header">
              <h2>{isEditingContact ? 'Edit Contact' : 'Create Contact'}</h2>
            </div>
            <form onSubmit={upsertContact}>
              <div className="form-group">
                <label htmlFor="demo-contact-name">Full Name *</label>
                <input
                  id="demo-contact-name"
                  value={contactForm.fullName}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="demo-contact-email">Email</label>
                <input
                  id="demo-contact-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="demo-contact-phone">Phone</label>
                <input
                  id="demo-contact-phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="form-actions">
                <button className="btn-primary" type="submit">{isEditingContact ? 'Update Contact' : 'Add Contact'}</button>
                <button className="btn-secondary" type="button" onClick={resetContactForm}>Reset</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="content-grid">
          <section className="contacts-list">
            <div className="section-header">
              <h2>Accounts</h2>
            </div>
            <div className="contacts-grid">
              {accounts.map((account) => (
                <article className="contact-card" key={account.id}>
                  <h3>{account.name}</h3>
                  <p className="email">{account.email || 'No email'}</p>
                  <p>{account.city || 'No city'}</p>
                  <div className="card-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => setAccountForm({
                        id: account.id,
                        name: account.name,
                        email: account.email,
                        city: account.city,
                      })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => setAccounts((prev) => prev.filter((a) => a.id !== account.id))}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="contact-form">
            <div className="section-header">
              <h2>{isEditingAccount ? 'Edit Account' : 'Create Account'}</h2>
            </div>
            <form onSubmit={upsertAccount}>
              <div className="form-group">
                <label htmlFor="demo-account-name">Account Name *</label>
                <input
                  id="demo-account-name"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="demo-account-email">Email</label>
                <input
                  id="demo-account-email"
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="demo-account-city">City</label>
                <input
                  id="demo-account-city"
                  value={accountForm.city}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="form-actions">
                <button className="btn-primary" type="submit">{isEditingAccount ? 'Update Account' : 'Add Account'}</button>
                <button className="btn-secondary" type="button" onClick={resetAccountForm}>Reset</button>
              </div>
            </form>
          </section>
        </div>
      )}

      <section className="tab-intro">
        <h3>Power Apps Runtime</h3>
        <p>
          To use live Dataverse operations (CRUD, lookups, and generated service calls), run this app
          in your Power Apps environment using PAC code app deployment.
        </p>
      </section>
    </div>
  );
}

function App() {
  if (!isPowerAppsRuntime()) {
    return <StandaloneStaticWebApp />;
  }

  return (
    <Suspense fallback={<div className="app-container"><p>Loading app...</p></div>}>
      <PowerAppsDataverseApp />
    </Suspense>
  );
}

export default App;
