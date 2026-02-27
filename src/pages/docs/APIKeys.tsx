import { DocsLayout } from '../../layouts/DocsLayout';
import { AlertTriangle, Lock } from 'lucide-react';

export const APIKeys = () => {
  return (
    <DocsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">API Keys & BYOK</h1>
          <p className="text-xl text-gray-400">
            Understanding the Bring Your Own Key model and how to manage your credentials securely.
          </p>
        </div>

        <div className="h-px bg-white/10 my-8" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Supported Providers</h2>
          <p className="text-gray-300">
            ClawNest supports the following LLM providers out of the box:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['OpenAI', 'Anthropic', 'OpenRouter', 'Mistral', 'Groq', 'Google Gemini'].map((provider) => (
              <div key={provider} className="p-4 rounded-lg bg-white/5 border border-white/10 text-center font-medium text-gray-300">
                {provider}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold text-white">Security Architecture</h2>
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-6 flex gap-4">
            <Lock className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-400 mb-2">Encryption at Rest</h4>
              <p className="text-sm text-gray-300">
                All API keys are encrypted using AES-256-GCM before being stored in our database. The decryption keys are managed via a separate Key Management Service (KMS) and are never stored alongside the data.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold text-white">Best Practices</h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <strong className="text-white block">Set Usage Limits</strong>
                <span className="text-gray-400 text-sm">Always configure hard usage limits (e.g., $50/month) directly in your provider's dashboard (OpenAI, Anthropic) to prevent unexpected bills.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <strong className="text-white block">Use Dedicated Keys</strong>
                <span className="text-gray-400 text-sm">Create specific API keys for ClawNest (e.g., named "ClawNest-Agent-1"). Do not reuse keys from other projects. This allows you to revoke access easily if needed.</span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </DocsLayout>
  );
};
