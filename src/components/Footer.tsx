import { Music, Mail, FileText, Shield } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
              <Music className="w-8 h-8 text-blue-500" />
              <span>Linkiz</span>
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed">
              The freemium multi-link music platform that allows you to centralize links and download audio files through a flexible subscription system.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              {currentYear} Linkiz. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Users are fully responsible for uploaded and downloaded content. GDPR compliant.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
