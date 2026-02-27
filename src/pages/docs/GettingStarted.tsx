import { DocsLayout } from '../../layouts/DocsLayout';
import { Terminal, CheckCircle, ArrowRight } from 'lucide-react';

export const GettingStarted = () => {
  return (
    <DocsLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
          <p className="text-xl text-gray-400">
            Deploy your first OpenClaw agent in less than 5 minutes.
          </p>
        </div>

        <div className="h-px bg-white/10" />

        <div className="space-y-12">
          {/* Step 1 */}
          <section className="relative pl-8 border-l border-white/10">
            <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-[#0a0a0a]">
              1
            </span>
            <h3 className="text-xl font-semibold text-white mb-3">Create an Account</h3>
            <p className="text-gray-300 mb-4">
              Sign up for a ClawNest account. You can start with a 14-day free trial on the Starter plan.
            </p>
            <div className="bg-black/50 rounded-lg p-4 border border-white/10 font-mono text-sm text-gray-400">
              <span className="text-green-400">➜</span> Navigate to <span className="text-blue-400">clawnest.eu/signup</span>
            </div>
          </section>

          {/* Step 2 */}
          <section className="relative pl-8 border-l border-white/10">
            <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-[#0a0a0a]">
              2
            </span>
            <h3 className="text-xl font-semibold text-white mb-3">Configure Your Instance</h3>
            <p className="text-gray-300 mb-4">
              Once logged in, click "New Agent". You'll need to provide a name and select your region (currently Sweden-Central).
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Choose a unique subdomain (e.g., my-agent.clawnest.eu)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Select resource tier (Starter/Pro)
              </li>
            </ul>
          </section>

          {/* Step 3 */}
          <section className="relative pl-8 border-l border-white/10">
            <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-[#0a0a0a]">
              3
            </span>
            <h3 className="text-xl font-semibold text-white mb-3">Connect API Keys</h3>
            <p className="text-gray-300 mb-4">
              ClawNest uses a BYOK (Bring Your Own Key) model. You must add at least one LLM provider key.
            </p>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
              <strong>Note:</strong> Your keys are encrypted at rest using AES-256 and are never visible to ClawNest staff.
            </div>
          </section>

          {/* Step 4 */}
          <section className="relative pl-8 border-l border-white/10">
            <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-[#0a0a0a]">
              4
            </span>
            <h3 className="text-xl font-semibold text-white mb-3">Launch</h3>
            <p className="text-gray-300 mb-4">
              Click "Deploy". Your agent will be live in approximately 60-90 seconds.
            </p>
            <button className="px-4 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        </div>
      </div>
    </DocsLayout>
  );
};
