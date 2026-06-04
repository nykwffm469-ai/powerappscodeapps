import { useState } from 'react';
import {
  Header,
  ErrorMessage,
  ContactList,
  ContactForm,
  AccountList,
  AccountForm,
  ApiActionsPanel,
} from './components';
import { useContacts, useAccounts, useAccountsCrud, useCurrentUser } from './hooks';

type ActivePage = 'contacts' | 'accounts' | 'apis';

function PowerAppsDataverseApp() {
  const [activePage, setActivePage] = useState<ActivePage>('contacts');

  const {
    contacts,
    loading: contactsLoading,
    error: contactsError,
    selectedContact,
    isCreating: isCreatingContact,
    startCreate: startCreateContact,
    selectContact,
    cancelForm: cancelContactForm,
    handleFormSubmit: handleContactFormSubmit,
    deleteContact,
  } = useContacts();

  const { accounts } = useAccounts();

  const {
    accounts: accountsList,
    loading: accountsLoading,
    error: accountsError,
    selectedAccount,
    isCreating: isCreatingAccount,
    startCreate: startCreateAccount,
    selectAccount,
    cancelForm: cancelAccountForm,
    handleFormSubmit: handleAccountFormSubmit,
    deleteAccount,
    loadAccounts,
  } = useAccountsCrud();

  const { currentUser, loading: userLoading, error: userError } = useCurrentUser();

  return (
    <div className="app-container">
      <Header
        title="Dataverse Demo App"
        description="Demonstrating the use of Dataverse with Power Apps Code Apps — CRUD, file storage, and custom APIs"
      />

      <nav className="page-tabs">
        <button
          className={`tab-btn ${activePage === 'contacts' ? 'active' : ''}`}
          onClick={() => setActivePage('contacts')}
        >
          CRUD
        </button>
        <button
          className={`tab-btn ${activePage === 'accounts' ? 'active' : ''}`}
          onClick={() => setActivePage('accounts')}
        >
          File Attachments
        </button>
        <button
          className={`tab-btn ${activePage === 'apis' ? 'active' : ''}`}
          onClick={() => setActivePage('apis')}
        >
          Functions &amp; Actions
        </button>
      </nav>

      {activePage === 'contacts' && (
        <>
          <div className="tab-intro">
            <h3>CRUD Operations</h3>
            <p>
              Demonstrates <strong>Create</strong>, <strong>Read</strong>, <strong>Update</strong>,
              and <strong>Delete</strong> on Contact records using auto-generated services from{' '}
              <code>pac code add-data-source</code>. Lookup fields link contacts to accounts
              via OData bind syntax. Select a contact to edit, or create a new one.
            </p>
          </div>
          <ErrorMessage error={contactsError} />
          <div className="content-grid">
            <ContactList
              contacts={contacts}
              selectedContact={selectedContact}
              loading={contactsLoading}
              onSelect={selectContact}
              onCreateNew={startCreateContact}
            />
            {(isCreatingContact || selectedContact) && (
              <ContactForm
                selectedContact={selectedContact}
                isCreating={isCreatingContact}
                accounts={accounts}
                onSubmit={handleContactFormSubmit}
                onCancel={cancelContactForm}
                onDelete={deleteContact}
              />
            )}
          </div>
        </>
      )}

      {activePage === 'accounts' && (
        <>
          <div className="tab-intro">
            <h3>Dataverse File Attachments</h3>
            <p>
              Demonstrates upload on <strong>entityimage</strong> using{' '}
              <code>AccountsService.upload()</code> from generated Dataverse services.
            </p>
          </div>
          <ErrorMessage error={accountsError} />
          <div className="content-grid">
            <AccountList
              accounts={accountsList}
              selectedAccount={selectedAccount}
              loading={accountsLoading}
              onSelect={selectAccount}
              onCreateNew={startCreateAccount}
            />
            {(isCreatingAccount || selectedAccount) && (
              <AccountForm
                selectedAccount={selectedAccount}
                isCreating={isCreatingAccount}
                onSubmit={handleAccountFormSubmit}
                onCancel={cancelAccountForm}
                onDelete={deleteAccount}
                onUploadSuccess={loadAccounts}
              />
            )}
          </div>
        </>
      )}

      {activePage === 'apis' && (
        <ApiActionsPanel
          currentUser={currentUser}
          loading={userLoading}
          error={userError}
        />
      )}
    </div>
  );
}

export default PowerAppsDataverseApp;
