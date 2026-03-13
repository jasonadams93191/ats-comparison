'use client'

import { Fragment, useState } from 'react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const deelMonthly = 500
const deelAnnual = deelMonthly * 12 // $6,000

const asymblPerUser = 90
const asymblUsers = 22
const asymblMonthly = asymblPerUser * asymblUsers // ~$1,980
const asymblAnnual = asymblMonthly * 12 // $23,760

const annualDiff = asymblAnnual - deelAnnual

/* ------------------------------------------------------------------ */
/*  Feature matrix                                                     */
/* ------------------------------------------------------------------ */

type Status = 'yes' | 'no' | 'partial' | 'limited'

interface Feature {
  category: string
  name: string
  deel: Status
  asymbl: Status
  note?: string
}

const features: Feature[] = [
  // Core ATS
  { category: 'Core ATS', name: 'Applicant tracking & pipeline management', deel: 'no', asymbl: 'yes', note: 'Deel has no candidate pipeline — it\'s an HR/payroll platform' },
  { category: 'Core ATS', name: 'Kanban board + list view for candidates', deel: 'no', asymbl: 'yes' },
  { category: 'Core ATS', name: 'Configurable hiring workflows per client/role', deel: 'no', asymbl: 'yes' },
  { category: 'Core ATS', name: 'Interview scheduling & feedback collection', deel: 'no', asymbl: 'yes' },
  { category: 'Core ATS', name: 'Job requisition management', deel: 'partial', asymbl: 'yes', note: 'Deel Talent allows requisitions but only for sourcing agencies' },
  { category: 'Core ATS', name: 'Resume parsing & candidate intake', deel: 'partial', asymbl: 'yes', note: 'Deel has basic AI parsing; Asymbl uses semantic NLP' },
  { category: 'Core ATS', name: 'Candidate communication (email/SMS)', deel: 'no', asymbl: 'yes' },
  { category: 'Core ATS', name: 'Branded candidate engagement campaigns', deel: 'no', asymbl: 'yes' },
  { category: 'Core ATS', name: 'Timesheet & placement management', deel: 'no', asymbl: 'yes', note: 'Asymbl Time module' },

  // AI & Automation
  { category: 'AI & Automation', name: 'AI-powered semantic candidate search', deel: 'no', asymbl: 'yes', note: 'Goes beyond Boolean — NLP + interaction data' },
  { category: 'AI & Automation', name: 'AI candidate ranking & matching', deel: 'partial', asymbl: 'yes', note: 'Deel has basic resume-to-JD matching only' },
  { category: 'AI & Automation', name: 'Predictive hiring intelligence', deel: 'no', asymbl: 'yes', note: 'Time-to-hire, cultural fit, placement success forecasting' },
  { category: 'AI & Automation', name: 'Autonomous AI agents (Agentforce)', deel: 'no', asymbl: 'yes', note: 'Auto job descriptions, screening, scheduling, summaries' },
  { category: 'AI & Automation', name: 'Bias detection in hiring data', deel: 'no', asymbl: 'yes' },
  { category: 'AI & Automation', name: 'Automated workflow triggers', deel: 'no', asymbl: 'yes', note: 'Salesforce Flow + Sales Engagement Cadence' },

  // Salesforce Integration
  { category: 'Salesforce Integration', name: 'Native Salesforce platform (runs inside SF)', deel: 'no', asymbl: 'yes', note: 'Asymbl IS Salesforce — not an integration' },
  { category: 'Salesforce Integration', name: 'Sales Cloud / CRM data shared with ATS', deel: 'no', asymbl: 'yes' },
  { category: 'Salesforce Integration', name: 'Einstein AI access', deel: 'no', asymbl: 'yes' },
  { category: 'Salesforce Integration', name: 'Salesforce Flow automation', deel: 'no', asymbl: 'yes' },
  { category: 'Salesforce Integration', name: 'Lightning App Builder customization', deel: 'no', asymbl: 'yes' },
  { category: 'Salesforce Integration', name: 'AppExchange ecosystem (7,000+ apps)', deel: 'no', asymbl: 'yes' },
  { category: 'Salesforce Integration', name: 'Salesforce Mobile compatible', deel: 'no', asymbl: 'yes' },
  { category: 'Salesforce Integration', name: 'Salesforce Shield (encryption, audit trail)', deel: 'no', asymbl: 'yes' },

  // Reporting & Analytics
  { category: 'Reporting & Analytics', name: 'Native Salesforce Reports & Dashboards', deel: 'no', asymbl: 'yes' },
  { category: 'Reporting & Analytics', name: 'Cross-object reporting (ATS + CRM + Ops)', deel: 'no', asymbl: 'yes' },
  { category: 'Reporting & Analytics', name: 'Custom report builder (no extra cost)', deel: 'no', asymbl: 'yes' },
  { category: 'Reporting & Analytics', name: 'Applicant lifecycle dashboards', deel: 'limited', asymbl: 'yes', note: 'Deel has agency dashboards only — not full ATS analytics' },
  { category: 'Reporting & Analytics', name: 'KPI tracking per recruiter/role/client', deel: 'no', asymbl: 'yes' },

  // Compliance & Security
  { category: 'Compliance & Security', name: 'SOC certification', deel: 'yes', asymbl: 'yes' },
  { category: 'Compliance & Security', name: 'EEO/OFCCP compliance tracking', deel: 'no', asymbl: 'partial', note: 'Configurable via SF custom fields/reports' },
  { category: 'Compliance & Security', name: 'Field-level security & permission sets', deel: 'partial', asymbl: 'yes', note: 'Asymbl inherits full Salesforce security model' },
  { category: 'Compliance & Security', name: 'Full data ownership (your org, your data)', deel: 'no', asymbl: 'yes', note: 'Deel stores data on their platform' },
  { category: 'Compliance & Security', name: 'Multi-currency support', deel: 'yes', asymbl: 'yes' },

  // Portals & Experience
  { category: 'Portals & Experience', name: 'Client portal (submit jobs, review candidates)', deel: 'no', asymbl: 'yes', note: 'Via Salesforce Experience Cloud' },
  { category: 'Portals & Experience', name: 'Candidate self-service portal', deel: 'no', asymbl: 'yes' },
  { category: 'Portals & Experience', name: 'Employee self-service portal', deel: 'yes', asymbl: 'partial', note: 'Deel has strong employee self-service for payroll/benefits' },
  { category: 'Portals & Experience', name: 'Mobile-first experience', deel: 'partial', asymbl: 'yes', note: 'Deel mobile described as "slow and buggy" in reviews' },
]

const categories = [...new Set(features.map(f => f.category))]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function usd(n: number) {
  return '$' + n.toLocaleString('en-US')
}

function Check({ status }: { status: Status }) {
  if (status === 'yes') return <span className="text-success font-bold text-base">&#10003;</span>
  if (status === 'partial') return <span className="text-[#F59E0B] font-bold text-base">~</span>
  if (status === 'limited') return <span className="text-[#F59E0B] font-bold text-[11px]">LTD</span>
  return <span className="text-[#D1D5DB] font-bold text-base">&#10007;</span>
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

type Tab = 'overview' | 'features' | 'cost' | 'salesforce' | 'recommendation'

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'features', label: 'Feature Matrix' },
  { key: 'cost', label: 'Cost Analysis' },
  { key: 'salesforce', label: 'Salesforce Advantage' },
  { key: 'recommendation', label: 'Recommendation' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleCategory = (cat: string) =>
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))

  /* count feature wins */
  const deelYes = features.filter(f => f.deel === 'yes').length
  const asymblYes = features.filter(f => f.asymbl === 'yes').length

  return (
    <div>
      {/* ── Header ── */}
      <header className="bg-charcoal text-[#FAFAF8] px-8 pt-7 pb-5 border-b-[3px] border-b-asymbl">
        <div className="max-w-[980px] mx-auto">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] mb-2">
                ATS Platform Evaluation &middot; March 2026
              </p>
              <h1 className="text-[26px] font-bold leading-tight">
                Deel vs. Asymbl
              </h1>
              <p className="text-[14px] text-[#9CA3AF] italic mt-1">
                Applicant Tracking System comparison for staffing &amp; recruiting operations
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-1">
              <span className="mono text-[12px] bg-asymbl text-white px-4 py-2 rounded-md">
                Recommended: Asymbl
              </span>
              <span className="mono text-[11px] bg-[#1E3A5F] text-[#93C5FD] px-3.5 py-1.5 rounded-md">
                Salesforce Native
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Info banner ── */}
      <div className="bg-asymbl-light border-b border-asymbl-border px-8 py-3">
        <p className="max-w-[980px] mx-auto text-[13px] text-asymbl leading-relaxed">
          Your team runs everything in Salesforce. Asymbl is 100% Salesforce-native — built on the platform,
          not bolted onto it. This evaluation compares a standalone HR/payroll tool (Deel) against a purpose-built
          staffing ATS that lives inside your existing Salesforce ecosystem.
        </p>
      </div>

      {/* ── Tab nav ── */}
      <nav className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] px-8">
        <div className="max-w-[980px] mx-auto flex">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3.5 py-3 text-[13px] border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-b-asymbl text-charcoal font-bold'
                  : 'border-b-transparent text-[#6B7280] hover:text-charcoal',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-[980px] mx-auto px-8 pt-7 pb-16">

        {/* ==================== OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-5">

            {/* Critical distinction */}
            <div className="bg-pain-light border border-pain-border border-l-4 border-l-pain rounded-lg p-4">
              <p className="text-[13px] text-pain font-bold mb-1">Critical Distinction</p>
              <p className="text-[13px] text-[#374151] leading-relaxed">
                <strong>Deel is not an ATS.</strong> It is a global HR, payroll, and Employer of Record (EOR) platform.
                It does not provide applicant tracking, candidate pipeline management, or staffing agency workflows.
                A staffing agency using Deel would still need a separate ATS for core recruiting operations.
              </p>
            </div>

            {/* Pain points */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                Key Evaluation Factors
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '⚠', title: 'Salesforce Is Home Base', detail: 'The team runs all operations in Salesforce. Any ATS that lives outside the platform creates data silos, integration overhead, and context-switching.' },
                  { icon: '⚠', title: 'Staffing-Specific Workflows', detail: 'Recruiting for clients requires candidate pipeline management, placement tracking, timesheets, and client portals — not just hiring for your own team.' },
                  { icon: '⚠', title: 'AI-Driven Placement', detail: 'The firm wants advanced AI for candidate matching, predictive hiring intelligence, and autonomous recruiting agents — not just basic resume parsing.' },
                  { icon: '⚠', title: 'Single Platform Strategy', detail: 'Consolidating tools into one ecosystem reduces integration tax, training overhead, and vendor management complexity.' },
                ].map(p => (
                  <div
                    key={p.title}
                    className="bg-white border border-pain-border border-l-[3px] border-l-pain rounded-lg p-4"
                  >
                    <p className="text-pain text-[18px] mb-1">{p.icon}</p>
                    <p className="text-[13px] font-bold text-charcoal">{p.title}</p>
                    <p className="text-[12px] text-[#374151] mt-1 leading-relaxed">{p.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Vendor cards side by side */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                Platform Comparison at a Glance
              </p>
              <div className="grid grid-cols-2 gap-3.5">
                {/* Deel card */}
                <div className="bg-white border border-deel-border border-l-4 border-l-deel rounded-lg p-5">
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-deel mb-2">
                    Deel — Standalone HR/Payroll Platform
                  </p>
                  <p className="text-[15px] font-bold text-deel">{usd(deelAnnual)}/yr</p>
                  <p className="text-[11px] text-[#6B7280] mb-3">{usd(deelMonthly)}/mo flat &middot; no setup fee</p>
                  <div className="space-y-1.5">
                    {[
                      'Global HR & payroll platform (not an ATS)',
                      'Employer of Record (EOR) services',
                      'Basic resume parsing',
                      'Integrates with ATS tools (Greenhouse, Lever)',
                      'No Salesforce integration (Zapier only)',
                      'No candidate pipeline management',
                      'No staffing client portal',
                    ].map(item => (
                      <div
                        key={item}
                        className="text-[12px] text-[#374151] border-l-2 border-l-deel-border pl-2.5"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Asymbl card */}
                <div className="bg-white border border-asymbl-border border-l-4 border-l-asymbl rounded-lg p-5">
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-asymbl mb-2">
                    Asymbl — Salesforce-Native ATS
                  </p>
                  <p className="text-[15px] font-bold text-asymbl">{usd(asymblAnnual)}/yr</p>
                  <p className="text-[11px] text-[#6B7280] mb-3">~{usd(asymblPerUser)}/user/mo &middot; {asymblUsers} users &middot; ~{usd(asymblMonthly)}/mo</p>
                  <div className="space-y-1.5">
                    {[
                      '100% Salesforce-native ATS (runs inside your org)',
                      'Full candidate pipeline with kanban + list views',
                      'AI semantic search & candidate matching',
                      'Agentforce AI agents for recruiting automation',
                      'Predictive hiring intelligence',
                      'Timesheet management (Asymbl Time)',
                      'Client & candidate portals via Experience Cloud',
                      'Salesforce Summit Partner',
                    ].map(item => (
                      <div
                        key={item}
                        className="text-[12px] text-[#374151] border-l-2 border-l-asymbl-border pl-2.5"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Architecture flow */}
            <section>
              <div className="bg-sf-light border border-sf-border border-l-4 border-l-sf rounded-lg p-[18px]">
                <p className="mono text-[10px] uppercase tracking-[0.12em] text-[#1D4ED8] mb-3">
                  Asymbl Architecture — Everything Inside Salesforce
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    'Job Requisition',
                    'Candidate Pipeline',
                    'AI Matching',
                    'Interview & Placement',
                    'Timesheets',
                    'Salesforce CRM',
                  ].map((step, i, arr) => (
                    <Fragment key={step}>
                      <span className="text-[12px] font-semibold text-[#1D4ED8] bg-white border border-sf-border rounded-full px-3 py-1">
                        {step}
                      </span>
                      {i < arr.length - 1 && (
                        <span className="text-sf font-bold text-[16px]">&rarr;</span>
                      )}
                    </Fragment>
                  ))}
                </div>
                <p className="text-[12px] text-[#1D4ED8] mt-3 leading-relaxed">
                  Every step lives natively in Salesforce — no middleware, no data exports, no separate login.
                  Recruiting data flows directly into your CRM, reports, and dashboards.
                </p>
              </div>
            </section>

            {/* Revenue Impact — MRR */}
            <section>
              <div className="bg-success-light border-2 border-success-border border-l-4 border-l-success rounded-lg p-[22px]">
                <p className="mono text-[10px] uppercase tracking-[0.12em] text-success-dark mb-2">
                  Revenue Impact — Speed to Placement Matters
                </p>
                <h2 className="text-[17px] font-bold text-charcoal mb-2">
                  Cheaper isn&apos;t always better — lost clients cost more than software
                </h2>
                <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
                  Your business model is <strong>Monthly Recurring Revenue (MRR)</strong>. Every client you
                  retain and every placement you accelerate compounds over time. You&apos;ve already lost potential
                  clients because placements weren&apos;t fast enough — that&apos;s not a software cost problem,
                  it&apos;s a <strong>revenue problem</strong>.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="bg-white border border-success-border rounded-lg p-3 text-center">
                    <p className="mono text-[10px] uppercase tracking-[0.12em] text-success-dark mb-1">1 Lost Client</p>
                    <p className="text-[24px] font-bold text-success">$5K–$15K</p>
                    <p className="text-[11px] text-[#6B7280]">lost MRR per month</p>
                  </div>
                  <div className="bg-white border border-success-border rounded-lg p-3 text-center">
                    <p className="mono text-[10px] uppercase tracking-[0.12em] text-success-dark mb-1">Over 12 Months</p>
                    <p className="text-[24px] font-bold text-success">$60K–$180K</p>
                    <p className="text-[11px] text-[#6B7280]">annual revenue lost</p>
                  </div>
                  <div className="bg-white border border-success-border rounded-lg p-3 text-center">
                    <p className="mono text-[10px] uppercase tracking-[0.12em] text-success-dark mb-1">Asymbl Difference</p>
                    <p className="text-[24px] font-bold text-asymbl">{usd(annualDiff)}</p>
                    <p className="text-[11px] text-[#6B7280]">annual cost over Deel</p>
                  </div>
                </div>
                <p className="text-[13px] text-success-dark font-bold mt-3">
                  One retained client pays for the entire Asymbl platform many times over.
                  The question isn&apos;t &quot;which ATS is cheaper?&quot; — it&apos;s &quot;which ATS helps you place faster and keep clients?&quot;
                </p>
              </div>
            </section>

            {/* Speed to placement comparison */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                Speed to Placement — How Each Platform Impacts Time-to-Fill
              </p>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white border border-deel-border border-l-4 border-l-deel rounded-lg p-4">
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-deel mb-2">Deel Workflow</p>
                  <div className="space-y-2">
                    {[
                      { step: 'Post job in separate ATS', time: 'Manual' },
                      { step: 'Search candidates in separate ATS', time: 'Boolean only' },
                      { step: 'Sync data to Salesforce via Zapier', time: 'Delayed' },
                      { step: 'Update client in Salesforce manually', time: 'Manual' },
                      { step: 'Switch between 2+ platforms', time: 'Context switching' },
                    ].map(item => (
                      <div key={item.step} className="flex justify-between text-[12px]">
                        <span className="text-[#374151]">{item.step}</span>
                        <span className="text-pain font-bold mono text-[11px]">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-asymbl-border border-l-4 border-l-asymbl rounded-lg p-4">
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-asymbl mb-2">Asymbl Workflow</p>
                  <div className="space-y-2">
                    {[
                      { step: 'Post job inside Salesforce', time: 'Instant' },
                      { step: 'AI semantic search + matching', time: 'Seconds' },
                      { step: 'Data already in Salesforce', time: 'No sync needed' },
                      { step: 'Client updated automatically via Flow', time: 'Automated' },
                      { step: 'Everything in one platform', time: 'Zero switching' },
                    ].map(item => (
                      <div key={item.step} className="flex justify-between text-[12px]">
                        <span className="text-[#374151]">{item.step}</span>
                        <span className="text-success font-bold mono text-[11px]">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== FEATURE MATRIX ==================== */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            {/* Score summary */}
            <div className="flex gap-4">
              <div className="flex-1 bg-deel-light border border-deel-border rounded-lg p-3 text-center">
                <p className="mono text-[10px] uppercase tracking-[0.12em] text-deel">Deel</p>
                <p className="text-[24px] font-bold text-deel">{deelYes}</p>
                <p className="mono text-[10px] text-[#9CA3AF]">of {features.length} capabilities</p>
              </div>
              <div className="flex-1 bg-asymbl-light border border-asymbl-border rounded-lg p-3 text-center">
                <p className="mono text-[10px] uppercase tracking-[0.12em] text-asymbl">Asymbl</p>
                <p className="text-[24px] font-bold text-asymbl">{asymblYes}</p>
                <p className="mono text-[10px] text-[#9CA3AF]">of {features.length} capabilities</p>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-charcoal text-[#9CA3AF]">
                    <th className="text-left py-2.5 px-4 mono text-[10px] uppercase tracking-[0.12em] font-normal w-2/5">
                      Capability
                    </th>
                    <th className="text-center py-2.5 px-3 mono text-[10px] uppercase tracking-[0.12em] font-normal text-deel">
                      Deel
                    </th>
                    <th className="text-center py-2.5 px-3 mono text-[10px] uppercase tracking-[0.12em] font-bold text-asymbl">
                      Asymbl
                    </th>
                    <th className="text-left py-2.5 px-4 mono text-[10px] uppercase tracking-[0.12em] font-normal w-1/3">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const rows = features.filter(f => f.category === cat)
                    const isCollapsed = collapsed[cat]
                    return (
                      <Fragment key={cat}>
                        <tr
                          className="bg-[#F9FAFB] cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                          onClick={() => toggleCategory(cat)}
                        >
                          <td
                            colSpan={4}
                            className="py-2.5 px-4 mono text-[11px] uppercase tracking-[0.08em] text-[#374151] font-bold"
                          >
                            <span className="mr-1.5 text-[#9CA3AF]">
                              {isCollapsed ? '▸' : '▾'}
                            </span>
                            {cat}
                            <span className="text-[#9CA3AF] font-normal ml-2">
                              ({rows.length})
                            </span>
                          </td>
                        </tr>
                        {!isCollapsed &&
                          rows.map((row, i) => (
                            <tr
                              key={row.name}
                              className={cn(
                                i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]',
                                'hover:bg-[#F5F5F0] transition-colors',
                              )}
                            >
                              <td className="py-2.5 px-4 text-[#374151]">{row.name}</td>
                              <td className="py-2.5 px-3 text-center">
                                <Check status={row.deel} />
                              </td>
                              <td className="py-2.5 px-3 text-center bg-asymbl-light/50">
                                <Check status={row.asymbl} />
                              </td>
                              <td className="py-2.5 px-4 text-[11px] text-[#6B7280] italic">
                                {row.note || ''}
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== COST ANALYSIS ==================== */}
        {activeTab === 'cost' && (
          <div className="space-y-5">

            {/* Summary boxes */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-deel-border rounded-lg p-5 text-center">
                <p className="mono text-[11px] uppercase tracking-[0.12em] text-deel mb-2">
                  Deel
                </p>
                <p className="text-[32px] font-bold text-deel">{usd(deelAnnual)}</p>
                <p className="mono text-[11px] text-[#9CA3AF] mt-1">{usd(deelMonthly)}/mo &middot; per year</p>
              </div>
              <div className="bg-white border-2 border-asymbl rounded-lg p-5 text-center">
                <p className="mono text-[11px] uppercase tracking-[0.12em] text-asymbl mb-2">
                  Asymbl
                </p>
                <p className="text-[32px] font-bold text-asymbl">{usd(asymblAnnual)}</p>
                <p className="mono text-[11px] text-[#9CA3AF] mt-1">~{usd(asymblMonthly)}/mo &middot; per year</p>
              </div>
              <div className="bg-warn-light border border-warn-border rounded-lg p-5 text-center">
                <p className="mono text-[11px] uppercase tracking-[0.12em] text-warn mb-2">
                  Annual Difference
                </p>
                <p className="text-[32px] font-bold text-warn">+{usd(annualDiff)}</p>
                <p className="mono text-[11px] text-[#9CA3AF] mt-1">Asymbl costs more</p>
              </div>
            </div>

            {/* Cost table */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-charcoal">
                    <th className="text-left py-2.5 px-4 mono text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF] font-normal">
                      Item
                    </th>
                    <th className="text-left py-2.5 px-4 mono text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF] font-normal">
                      Details
                    </th>
                    <th className="text-right py-2.5 px-4 mono text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF] font-normal">
                      Monthly
                    </th>
                    <th className="text-right py-2.5 px-4 mono text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF] font-normal">
                      Annual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Deel section */}
                  <tr className="bg-deel-light">
                    <td colSpan={4} className="py-2 px-4 mono text-[10px] uppercase tracking-[0.12em] text-deel font-bold">
                      Deel
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 font-bold text-charcoal">ATS Package</td>
                    <td className="py-2.5 px-4 text-[#374151]">Flat rate, no per-user pricing</td>
                    <td className="py-2.5 px-4 text-right font-bold text-charcoal">{usd(deelMonthly)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-charcoal">{usd(deelAnnual)}</td>
                  </tr>
                  <tr className="bg-[#FAFAFA]">
                    <td className="py-2.5 px-4 text-[#374151]">Setup Fee</td>
                    <td className="py-2.5 px-4 text-[#374151]">No setup charge</td>
                    <td className="py-2.5 px-4 text-right text-success">—</td>
                    <td className="py-2.5 px-4 text-right text-success">{usd(0)}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 text-[#374151]">Salesforce Integration</td>
                    <td className="py-2.5 px-4 text-[#374151]">Zapier only — no native connector</td>
                    <td className="py-2.5 px-4 text-right italic text-[#6B7280]">est.</td>
                    <td className="py-2.5 px-4 text-right italic text-[#6B7280]">TBD</td>
                  </tr>
                  <tr className="bg-[#FAFAFA]">
                    <td className="py-2.5 px-4 text-[#374151]">Separate ATS Required</td>
                    <td className="py-2.5 px-4 text-pain italic">Deel is not an ATS — you&apos;d still need one</td>
                    <td className="py-2.5 px-4 text-right italic text-pain">+???</td>
                    <td className="py-2.5 px-4 text-right italic text-pain">+???</td>
                  </tr>
                  <tr className="border-t-2 border-t-[#E5E7EB]">
                    <td colSpan={2} className="py-2.5 px-4 font-bold text-charcoal">Deel Total (ATS package only)</td>
                    <td className="py-2.5 px-4 text-right font-bold text-deel">{usd(deelMonthly)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-deel text-[15px]">{usd(deelAnnual)}</td>
                  </tr>

                  {/* Asymbl section */}
                  <tr className="bg-asymbl-light">
                    <td colSpan={4} className="py-2 px-4 mono text-[10px] uppercase tracking-[0.12em] text-asymbl font-bold border-t border-[#E5E7EB]">
                      Asymbl
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 font-bold text-charcoal">ATS + Search</td>
                    <td className="py-2.5 px-4 text-[#374151]">{asymblUsers} users × {usd(asymblPerUser)}/user/mo</td>
                    <td className="py-2.5 px-4 text-right font-bold text-charcoal">{usd(asymblMonthly)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-charcoal">{usd(asymblAnnual)}</td>
                  </tr>
                  <tr className="bg-[#FAFAFA]">
                    <td className="py-2.5 px-4 text-[#374151]">Agentforce Suite</td>
                    <td className="py-2.5 px-4 text-[#374151]">AI agents add-on ($25/user/mo available)</td>
                    <td className="py-2.5 px-4 text-right italic text-[#6B7280]">optional</td>
                    <td className="py-2.5 px-4 text-right italic text-[#6B7280]">optional</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 text-[#374151]">Setup Fee</td>
                    <td className="py-2.5 px-4 text-[#374151]">15% support package required</td>
                    <td className="py-2.5 px-4 text-right italic text-[#6B7280]">incl.</td>
                    <td className="py-2.5 px-4 text-right italic text-[#6B7280]">incl.</td>
                  </tr>
                  <tr className="bg-[#FAFAFA]">
                    <td className="py-2.5 px-4 text-[#374151]">Salesforce Integration</td>
                    <td className="py-2.5 px-4 text-success font-bold">Native — no integration cost</td>
                    <td className="py-2.5 px-4 text-right text-success">{usd(0)}</td>
                    <td className="py-2.5 px-4 text-right text-success">{usd(0)}</td>
                  </tr>
                  <tr className="border-t-2 border-t-asymbl-border">
                    <td colSpan={2} className="py-2.5 px-4 font-bold text-charcoal">Asymbl Total</td>
                    <td className="py-2.5 px-4 text-right font-bold text-asymbl">{usd(asymblMonthly)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-asymbl text-[15px]">{usd(asymblAnnual)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ROI callout */}
            <div className="bg-sf-light border border-sf-border border-l-4 border-l-sf rounded-lg p-4">
              <p className="text-[13px] font-bold text-[#1D4ED8] mb-2">The Real Cost Equation</p>
              <p className="text-[13px] text-[#374151] leading-relaxed">
                Asymbl costs <strong>{usd(annualDiff)}/yr more</strong> than Deel&apos;s quoted package — but Deel
                is not an ATS. To get equivalent functionality, Deel would need to be paired with a separate ATS
                (Bullhorn, JobAdder, etc.), adding $5,000–$15,000+/yr in additional licensing plus ongoing
                integration costs and maintenance. <strong>Asymbl&apos;s total cost of ownership is likely lower</strong> when
                you factor in the complete staffing workflow.
              </p>
            </div>

            {/* MRR framing */}
            <div className="bg-success-light border border-success-border border-l-4 border-l-success rounded-lg p-4">
              <p className="text-[13px] font-bold text-success-dark mb-2">The MRR Equation</p>
              <p className="text-[13px] text-[#374151] leading-relaxed">
                Your revenue model is MRR — every placement generates recurring monthly income. Saving
                {' '}<strong>{usd(annualDiff)}/yr</strong> on software means nothing if slow placements cost you even
                one client worth $5K–$10K/mo in recurring revenue. A single lost client at $7,500/mo MRR
                represents <strong>$90,000/yr in lost revenue</strong> — that&apos;s <strong>5× the entire cost difference</strong> between
                Deel and Asymbl. Invest in the platform that helps you place faster and retain clients.
              </p>
            </div>

            {/* Hidden costs */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                Hidden Costs of a Non-Native Solution
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'Integration Middleware', detail: 'Zapier plans, custom API connectors, or iPaaS tools to sync Deel with Salesforce. Ongoing maintenance required.' },
                  { title: 'Separate ATS License', detail: 'Deel doesn\'t replace an ATS. You\'d need Bullhorn, JobAdder, or similar — adding $5K–$15K+/yr.' },
                  { title: 'Data Sync & Deduplication', detail: 'Maintaining consistent records across two platforms. Manual cleanup when syncs break.' },
                  { title: 'Training & Context Switching', detail: 'Staff trained on two platforms instead of one. Workflows split between Salesforce and external tools.' },
                ].map(c => (
                  <div key={c.title} className="bg-white border border-pain-border border-l-[3px] border-l-pain rounded-lg p-4">
                    <p className="text-[13px] font-bold text-charcoal">{c.title}</p>
                    <p className="text-[12px] text-[#374151] mt-1 leading-relaxed">{c.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== SALESFORCE ADVANTAGE ==================== */}
        {activeTab === 'salesforce' && (
          <div className="space-y-5">

            {/* Hero callout */}
            <div className="bg-sf-light border-2 border-sf-border border-l-4 border-l-sf rounded-lg p-[22px]">
              <p className="mono text-[10px] uppercase tracking-[0.12em] text-sf mb-2">
                Why Salesforce-Native Matters
              </p>
              <h2 className="text-[17px] font-bold text-charcoal mb-2">
                Your team already lives in Salesforce — your ATS should too
              </h2>
              <p className="text-[13px] text-[#374151] leading-relaxed">
                Asymbl isn&apos;t integrated with Salesforce — it <strong>is</strong> Salesforce. Every record, every workflow,
                every report lives in the same org as your CRM. No middleware, no sync delays, no data silos.
                When a recruiter updates a candidate, that data is instantly available to sales, operations, and leadership
                through the same dashboards they already use.
              </p>
            </div>

            {/* Advantage cards */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                Platform Capabilities — Asymbl on Salesforce
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    title: 'Einstein AI & Agentforce',
                    detail: 'Access Salesforce Einstein for predictive scoring plus Asymbl\'s purpose-built Agentforce agents that autonomously create job descriptions, screen candidates, schedule interviews, and generate summaries.',
                    color: 'border-l-asymbl',
                  },
                  {
                    title: 'Salesforce Flow Automation',
                    detail: 'Drag-and-drop workflow builder for candidate stage progression, automated notifications, approval processes, and multi-step recruiting sequences — no code required.',
                    color: 'border-l-sf',
                  },
                  {
                    title: 'Native Reports & Dashboards',
                    detail: 'Full Salesforce reporting engine at no extra cost. Cross-object reports spanning ATS data, sales pipeline, and operations. Scheduled reports, subscriptions, and dashboard snapshots.',
                    color: 'border-l-sf',
                  },
                  {
                    title: 'Single Source of Truth',
                    detail: 'Candidates, clients, jobs, placements, and revenue all in one platform. No duplicate records, no reconciliation, no "which system is correct?" debates.',
                    color: 'border-l-asymbl',
                  },
                  {
                    title: 'AppExchange Ecosystem',
                    detail: '7,000+ apps that plug directly into your recruiting workflows — DocuSign, background check providers, job board connectors, Conga, Formstack, and more.',
                    color: 'border-l-sf',
                  },
                  {
                    title: 'Data Ownership & Portability',
                    detail: 'All data stored in YOUR Salesforce org in standard CRM format. Full export capability, no vendor lock-in. If you ever leave Asymbl, your data stays in Salesforce.',
                    color: 'border-l-asymbl',
                  },
                  {
                    title: 'Enterprise Security',
                    detail: 'Inherit Salesforce\'s security model — field-level security, profiles, permission sets, sharing rules, and Salesforce Shield for encryption and audit trails.',
                    color: 'border-l-sf',
                  },
                  {
                    title: 'Experience Cloud Portals',
                    detail: 'Build branded client portals (submit jobs, review candidates, approve timesheets) and candidate portals — all powered by Salesforce Experience Cloud.',
                    color: 'border-l-asymbl',
                  },
                ].map(a => (
                  <div
                    key={a.title}
                    className={cn('bg-white border border-sf-border border-l-[3px] rounded-lg p-4', a.color)}
                  >
                    <p className="text-[13px] font-bold text-charcoal">{a.title}</p>
                    <p className="text-[12px] text-[#374151] mt-1 leading-relaxed">{a.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Deel comparison */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                What You Lose with a Standalone Platform (Deel)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-pain-border border-l-[3px] border-l-pain rounded-lg p-4 bg-white">
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-pain mb-2">With Deel (Standalone)</p>
                  <div className="space-y-2">
                    {[
                      'Data lives on Deel\'s servers — not in Salesforce',
                      'Zapier-only sync — delays, failures, maintenance',
                      'No access to Einstein AI or Agentforce',
                      'No Salesforce Flow automation for recruiting',
                      'Separate reporting system with limited analytics',
                      'Two platforms to train staff on',
                      'No AppExchange integration',
                    ].map(item => (
                      <p key={item} className="text-[12px] text-[#374151] flex gap-2">
                        <span className="text-pain font-bold">✗</span> {item}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="border border-success-border border-l-[3px] border-l-success rounded-lg p-4 bg-white">
                  <p className="mono text-[10px] uppercase tracking-[0.12em] text-success mb-2">With Asymbl (Salesforce-Native)</p>
                  <div className="space-y-2">
                    {[
                      'All data in your Salesforce org — you own it',
                      'Zero integration — it IS Salesforce',
                      'Full Einstein AI + Agentforce access',
                      'Salesforce Flow for every recruiting workflow',
                      'Native Reports & Dashboards — cross-object',
                      'One platform — staff already knows Salesforce',
                      'Full AppExchange ecosystem available',
                    ].map(item => (
                      <p key={item} className="text-[12px] text-[#374151] flex gap-2">
                        <span className="text-success font-bold">✓</span> {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Founder credibility */}
            <div className="bg-asymbl-light border border-asymbl-border rounded-lg p-4">
              <p className="text-[13px] text-[#374151] leading-relaxed">
                <span className="font-bold text-asymbl">About Asymbl:</span> Founded by Brandon Metcalf, who built
                <strong> Talent Rover</strong> — a Salesforce-native staffing ATS that made the <strong>Inc. 500 list
                as the 9th fastest-growing software company in America</strong> before being acquired by
                <strong> Bullhorn</strong> in 2018. Asymbl is the next generation of that proven approach.
                Salesforce Summit Partner with 150+ employees.
              </p>
            </div>
          </div>
        )}

        {/* ==================== RECOMMENDATION ==================== */}
        {activeTab === 'recommendation' && (
          <div className="space-y-5">

            {/* Verdict */}
            <div className="bg-asymbl-light border-2 border-asymbl-border border-l-4 border-l-asymbl rounded-lg p-[22px]">
              <p className="mono text-[10px] uppercase tracking-[0.12em] text-asymbl mb-2">
                Recommendation
              </p>
              <h2 className="text-[17px] font-bold text-charcoal mb-2">
                Adopt Asymbl as your Salesforce-native ATS platform
              </h2>
              <p className="text-[13px] text-[#374151] leading-relaxed">
                For a staffing operation that runs on Salesforce, Asymbl is the clear choice. It delivers a
                true ATS with AI-powered recruiting, predictive analytics, and Agentforce automation — all
                natively inside the Salesforce ecosystem you already operate in. Deel, while a capable
                HR/payroll platform, does not provide applicant tracking functionality and would require
                a separate ATS purchase plus integration work to achieve basic parity.
              </p>
            </div>

            {/* Score comparison */}
            <div className="flex gap-4">
              <div className="flex-1 bg-deel-light border border-deel-border rounded-lg p-4 text-center">
                <p className="mono text-[10px] uppercase tracking-[0.12em] text-deel mb-1">Deel Feature Score</p>
                <p className="text-[28px] font-bold text-deel">{deelYes}/{features.length}</p>
              </div>
              <div className="flex-1 bg-asymbl-light border-2 border-asymbl rounded-lg p-4 text-center">
                <p className="mono text-[10px] uppercase tracking-[0.12em] text-asymbl mb-1">Asymbl Feature Score</p>
                <p className="text-[28px] font-bold text-asymbl">{asymblYes}/{features.length}</p>
              </div>
            </div>

            {/* Key advantages */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                Key Advantages
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'True ATS Functionality', detail: 'Full candidate pipeline, kanban boards, hiring workflows, interview management, and placement tracking — Deel offers none of this.' },
                  { title: 'Salesforce Native', detail: 'Lives inside your existing Salesforce org. No integration, no middleware, no data silos. One platform for CRM + recruiting.' },
                  { title: 'AI-Powered Recruiting', detail: 'Semantic search, predictive hiring intelligence, and Agentforce AI agents that automate job descriptions, screening, and scheduling.' },
                  { title: 'Proven Staffing Pedigree', detail: 'Built by the founder of Talent Rover (acquired by Bullhorn). Deep staffing industry expertise, not a generic HR tool.' },
                  { title: 'Lower Total Cost of Ownership', detail: 'Despite higher sticker price, eliminates need for separate ATS + integration middleware. True TCO is likely lower.' },
                  { title: 'Data Ownership', detail: 'All data in YOUR Salesforce org. No vendor lock-in, standard CRM format, full export capability at any time.' },
                ].map(a => (
                  <div
                    key={a.title}
                    className="bg-white border border-success-border border-l-[3px] border-l-success rounded-lg p-4"
                  >
                    <p className="text-[13px] font-bold text-charcoal">{a.title}</p>
                    <p className="text-[12px] text-[#374151] mt-1 leading-relaxed">{a.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Considerations */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                Considerations
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'Higher Monthly Cost', detail: `Asymbl is ${usd(annualDiff)}/yr more than Deel's quoted package. However, Deel would require an additional ATS to be functional.` },
                  { title: 'Salesforce License Required', detail: 'Asymbl requires an existing Salesforce org (Sales Cloud). Salesforce licenses are sold separately from Asymbl.' },
                  { title: '12-Month Commitment', detail: 'Annual billing with 12-month minimum contract. 15% support package fee on top of licensing.' },
                  { title: 'Resume Parsing', detail: 'Not explicitly highlighted as a standalone feature — confirm with Asymbl during evaluation whether built-in or via AppExchange partner.' },
                ].map(c => (
                  <div
                    key={c.title}
                    className="bg-white border border-warn-border border-l-[3px] border-l-warn rounded-lg p-4"
                  >
                    <p className="text-[13px] font-bold text-charcoal">{c.title}</p>
                    <p className="text-[12px] text-[#374151] mt-1 leading-relaxed">{c.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Migration timeline */}
            <section>
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6B7280] mb-3">
                Onboarding Timeline
              </p>
              <div className="space-y-0 relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-[#E5E7EB]" />
                {[
                  {
                    phase: '1',
                    dates: 'Weeks 1–2',
                    title: 'Contract & Provisioning',
                    color: 'bg-asymbl',
                    tasks: [
                      'Finalize Asymbl contract and user licensing',
                      'Install Asymbl package in Salesforce org',
                      'Configure user profiles and permission sets',
                    ],
                  },
                  {
                    phase: '2',
                    dates: 'Weeks 2–4',
                    title: 'Configuration & Data Setup',
                    color: 'bg-sf',
                    tasks: [
                      'Configure hiring workflows, stages, and templates',
                      'Set up job requisition templates per client/industry',
                      'Import existing candidate data (if migrating from another system)',
                      'Configure Asymbl Time for timesheet management',
                    ],
                  },
                  {
                    phase: '3',
                    dates: 'Weeks 4–5',
                    title: 'AI & Automation Setup',
                    color: 'bg-success',
                    tasks: [
                      'Enable AI search and candidate matching',
                      'Configure Agentforce agents (optional add-on)',
                      'Build Salesforce Flow automations for recruiting workflows',
                      'Set up reports and dashboards',
                    ],
                  },
                  {
                    phase: '4',
                    dates: 'Weeks 5–6',
                    title: 'Training & Go Live',
                    color: 'bg-warn',
                    tasks: [
                      'Staff training on Asymbl ATS within Salesforce',
                      'UAT with live job requisitions',
                      'Go live with production recruiting workflows',
                      'Post-launch monitoring and optimization',
                    ],
                  },
                ].map(p => (
                  <div key={p.phase} className="flex gap-5 py-3 relative">
                    <div className="flex flex-col items-center z-10 flex-shrink-0">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold',
                          p.color,
                        )}
                      >
                        {p.phase}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="mono text-[10px] text-[#9CA3AF]">{p.dates}</p>
                      <p className="text-[11px] font-bold text-charcoal">{p.title}</p>
                      <div className="mt-2 space-y-2">
                        {p.tasks.map(t => (
                          <div
                            key={t}
                            className="bg-white border border-[#E5E7EB] rounded-md px-4 py-2.5 text-[13px] text-[#374151]"
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Conclusion */}
            <div className="bg-asymbl-light border-2 border-asymbl-border rounded-lg p-5 text-center">
              <p className="text-[14px] font-bold text-asymbl">
                Asymbl delivers a true Salesforce-native ATS with AI-powered recruiting — the right platform
                for a staffing operation that lives in Salesforce.
              </p>
            </div>

            <p className="mono text-[10px] text-[#9CA3AF] text-center tracking-[0.08em]">
              Generated by ACS AI Platform &middot; March 2026
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
