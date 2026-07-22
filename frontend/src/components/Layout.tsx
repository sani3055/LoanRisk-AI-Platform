import React from 'react';
import { User, signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { Sidebar } from './Sidebar';

export function Layout({ user, children, title }: { user: User, children: React.ReactNode, title: string }) {
  return (
    <main>
      <Sidebar />
      <section>
        <header>
          <div>
            <small>RISK ANALYTICS PLATFORM</small>
            <h1>{title}</h1>
          </div>
          <div className="profile">
            {user.email}{' '}
            <button className="logout" onClick={() => signOut(auth)}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
