import React from 'react';

function Footer() {
  return (
    <div>
      <footer className="mt-20 bg-slate-950 border-t border-slate-800 text-slate-400">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-bold">
                  RB
                </div>

                <span className="text-xl font-bold text-white">
                  RoleBase API
                </span>
              </div>

              <p className="mt-4 text-sm leading-6">
                Secure role-based access control and scalable CRUD API
                management platform for modern applications.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-white font-semibold">Product</h3>

              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    User Management
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Role Permission
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-cyan-400">
                    API Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-white font-semibold">Developer</h3>

              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400">
                    API Documentation
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Endpoints
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-cyan-400">
                    Database Schema
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-white font-semibold">System</h3>

              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                API Online
              </div>

              <p className="mt-3 text-sm">Version 1.0.0</p>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm">
            © 2026 RoleBase API. Built for secure CRUD applications.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
