import { DocsLayout } from '../../layouts/DocsLayout';

export const Introduction = () => {
  return (
    <DocsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">Introduction to ClawNest</h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            ClawNest is the premier managed hosting platform for OpenClaw, designed to remove the operational complexity of running autonomous AI agents.
          </p>
        </div>

        <div className="h-px bg-white/10 my-8" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">What is ClawNest?</h2>
          <p className="text-gray-300 leading-relaxed">
            While OpenClaw provides the powerful engine for autonomous AI agents, running it 24/7 requires significant infrastructure: servers, Docker containers, database management, and constant updates.
          </p>
          <p className="text-gray-300 leading-relaxed">
            ClawNest solves this by providing a <strong>fully managed environment</strong>. We handle the infrastructure, security, and updates, allowing you to focus purely on configuring your agent's behavior and skills.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">For Developers</h3>
            <p className="text-sm text-gray-400">
              Skip the DevOps. Get direct access to logs, shell, and VPN integration while we handle the uptime.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">For Teams</h3>
            <p className="text-sm text-gray-400">
              Collaborate on agent configurations, share workspaces, and manage billing centrally.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Core Philosophy</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
            <li><strong>Privacy First:</strong> Hosted in Sweden (EU) under strict GDPR guidelines.</li>
            <li><strong>No Lock-in:</strong> Bring your own API keys. We don't mark up token costs.</li>
            <li><strong>Reliability:</strong> Enterprise-grade infrastructure with automated backups.</li>
          </ul>
        </section>
      </div>
    </DocsLayout>
  );
};
