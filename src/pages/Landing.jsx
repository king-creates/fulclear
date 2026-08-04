import { Link }        from 'react-router-dom';
import { GraduationCap, CheckCircle, ArrowRight, Shield, Clock, FileText } from 'lucide-react';
import { Button }      from '../component/common';
import { ROUTES }      from '../constants/routes';

const features = [
  { icon: <FileText size={24} />, title: 'Online Applications', desc: 'Submit and track your clearance application from anywhere.' },
  { icon: <Clock    size={24} />, title: 'Real-Time Status',    desc: 'Monitor your clearance progress across all departments.' },
  { icon: <Shield   size={24} />, title: 'Secure & Reliable',   desc: 'Your documents and data are protected with JWT authentication.' },
];

const Landing = () => (
  <div style={{ minHeight: '100vh', background: 'var(--color-white)' }}>

    {/* Navbar */}
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 'var(--space-4) var(--space-8)',
      borderBottom: '1px solid var(--color-gray-200)',
      position: 'sticky', top: 0, background: 'var(--color-white)', zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <GraduationCap size={32} color="var(--color-primary-700)" />
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary-700)', lineHeight: 1.1 }}>FUL Clearance</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Federal University Lokoja</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Link to={ROUTES.LOGIN}>
          <Button variant="secondary">Sign In</Button>
        </Link>
        <Link to={ROUTES.REGISTER}>
          <Button variant="primary">Get Started</Button>
        </Link>
      </div>
    </nav>

    {/* Hero */}
    <section style={{
      background: 'linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 100%)',
      color: 'var(--color-white)',
      padding: 'var(--space-24) var(--space-8)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <span style={{
          display: 'inline-block', background: 'rgba(251,191,36,0.15)',
          color: 'var(--color-gold-400)', padding: '4px var(--space-4)',
          borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 'var(--space-5)',
          border: '1px solid rgba(251,191,36,0.25)',
        }}>
          Student Online Clearance System
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-extrabold)', color: 'var(--color-white)', marginBottom: 'var(--space-5)', lineHeight: 1.15 }}>
          Clear your graduation <span style={{ color: 'var(--color-gold-400)' }}>faster than ever</span>
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-8)', lineHeight: 1.7 }}>
          No more long queues. Complete your entire FUL clearance process online — from document submission to certificate download.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={ROUTES.REGISTER}>
            <Button variant="gold" size="lg">
              Start Clearance <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary" size="lg" style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Features */}
    <section style={{ padding: 'var(--space-20) var(--space-8)', background: 'var(--color-gray-50)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-12)', color: 'var(--color-gray-900)' }}>
          Everything you need, in one place
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius)',
                background: 'var(--color-primary-50)', color: 'var(--color-primary-700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)', color: 'var(--color-gray-900)' }}>{f.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer style={{ background: 'var(--color-primary-900)', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
      © {new Date().getFullYear()} Federal University Lokoja — Student Online Clearance System
    </footer>
  </div>
);

export default Landing;