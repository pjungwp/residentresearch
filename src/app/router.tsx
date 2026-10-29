import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Link, Outlet } from 'react-router-dom';
import { ProjectShell, ThemeSync, UpdatePrompt } from '@/components/shell';
import { ProjectsPage, SettingsPage, AboutPage, BlueprintPage, ProjectIndexRedirect, WeekRedirect } from '@/features/pages';
import { HomePage, AcademyHome, AcademyWeek } from '@/features/academy';
import { Navigate } from 'react-router-dom';
import { StudioPage } from '@/features/studio';
import { WeekPage } from '@/features/week';

const EvidencePage = lazy(() => import('@/features/evidence').then((m) => ({ default: m.EvidencePage })));
const ProposalPage = lazy(() => import('@/features/proposal').then((m) => ({ default: m.ProposalPage })));
const ReviewPage = lazy(() => import('@/features/review').then((m) => ({ default: m.ReviewPage })));

const S = (el: ReactNode) => <Suspense fallback={<div className="p-6 text-slate">Loading…</div>}>{el}</Suspense>;

function Root() {
  return (
    <>
      <ThemeSync />
      <Outlet />
      <UpdatePrompt />
    </>
  );
}

function RouteError() {
  return (
    <div className="mx-auto max-w-[560px] px-6 py-16 text-center">
      <h1 className="text-[1.5rem] font-bold">Something went wrong</h1>
      <p className="mt-2 text-slate">Your work is saved in this browser and was not affected. Reload to continue.</p>
      <div className="mt-5 flex justify-center gap-2">
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
        <Link to="/" className="btn btn-secondary">Home</Link>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/academy', element: <AcademyHome /> },
      { path: '/academy/week/:n', element: <AcademyWeek /> },
      { path: '/concierge', element: <ProjectsPage /> },
      { path: '/projects', element: <Navigate to="/concierge" replace /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/about', element: <AboutPage /> },
      {
        path: '/p/:id',
        element: <ProjectShell />,
        children: [
          { index: true, element: <ProjectIndexRedirect /> },
          { path: 'stage/:n', element: <WeekPage /> },
          { path: 'week/:n', element: <WeekRedirect /> },
          { path: 'mentor', element: <StudioPage /> },
          { path: 'blueprint', element: <BlueprintPage /> },
          { path: 'evidence', element: S(<EvidencePage />) },
          { path: 'proposal', element: S(<ProposalPage />) },
          { path: 'review', element: S(<ReviewPage />) }
        ]
      },
      { path: '*', element: <RouteError /> }
    ]
  }
]);
