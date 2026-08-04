import { BrowserRouter } from 'react-router-dom';
import { Provider }      from 'react-redux';
import { Toaster }       from 'react-hot-toast';
import store             from './store/index';
import AppRoutes         from './routes/index';
import ErrorBoundary      from './component/common/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize:   '14px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
</BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}


export default App;