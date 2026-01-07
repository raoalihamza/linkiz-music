import { useState } from 'react';
import { X, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithPassword, signUpWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = authMode === 'signup'
      ? await signUpWithPassword(email, password)
      : await signInWithPassword(email, password);

    if (error) {
      if (error.message.includes('Email not confirmed') || error.message.includes('EmailNotConfirmed')) {
        setError('⚠️ La confirmation d\'email est activée dans Supabase. Allez dans Authentication → Providers → Email et désactivez "Confirm email".');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe invalide. Vérifiez vos identifiants.');
      } else if (error.message.includes('User already registered')) {
        setError('Cet email est déjà enregistré. Utilisez l\'onglet "Se connecter".');
      } else if (error.message.includes('Password should be at least')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (error.message.includes('Unable to validate email')) {
        setError('Format d\'email invalide. Vérifiez votre adresse email.');
      } else {
        setError(`Erreur: ${error.message}`);
      }
      setLoading(false);
    } else {
      if (authMode === 'signup') {
        setSuccess('Compte créé avec succès!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        onClose();
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {authMode === 'signup' ? 'Créer un compte' : 'Se connecter'}
          </h2>
          <p className="text-gray-600">
            {authMode === 'signup'
              ? 'Créez votre hub de liens musicaux'
              : 'Accédez à votre dashboard'}
          </p>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              authMode === 'signup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              authMode === 'signin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Se connecter
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min. 6 caractères"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-600 font-medium">{success}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {authMode === 'signup' ? 'Création du compte...' : 'Connexion...'}
              </>
            ) : (
              authMode === 'signup' ? 'Créer mon compte' : 'Se connecter'
            )}
          </button>
        </form>

        {error && error.includes('confirmation') && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-1">💡 Solution rapide:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Ouvrez votre dashboard Supabase</li>
              <li>Authentication → Providers → Email</li>
              <li>Désactivez "Confirm email"</li>
              <li>Sauvegardez et réessayez</li>
            </ol>
          </div>
        )}

        <p className="mt-6 text-xs text-center text-gray-500">
          En vous inscrivant, vous acceptez nos CGU et Politique de confidentialité.
          Vous confirmez être responsable de tout contenu téléchargé.
        </p>

        {!error && (
          <p className="mt-2 text-xs text-center text-gray-400">
            Problème de connexion? Consultez TROUBLESHOOTING.md
          </p>
        )}
      </div>
    </div>
  );
}
