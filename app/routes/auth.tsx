// import {runMain} from "node:module";
import { usePuterStore } from "~/lib/puter";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";
export const meta =()=>([
  {title:'Resumind | Auth' },
  { name: 'description', content: 'Log into your account'},
]);
const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location=useLocation();
  const next = location.search.split('next=')[1];
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && auth.isAuthenticated) {
      navigate(next || "/", { replace: true });
    }
  }, [isLoading, auth.isAuthenticated, next, navigate]);
  return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center h-full">
        <div className="gradient-border shadow-lg">
          <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1>Welcome</h1>
              <h2>Log In to Continue Your Job Jurney</h2>
            </div>
            <div >
              {isLoading ? (
                  <button className="auth-button animate-pulse">
                    <p>signing you in...</p>
                  </button>
              ):(
                  <>
                    {auth.isAuthenticated ? (
                        <button className="auth-button" onClick={auth.signOut} >
                          <p>Log Out..</p>
                        </button>
                    ):(
                        <button className="auth-button" onClick={auth.signIn} >
                          <p>Sign in..</p>
                        </button>
                    )}
                  </>
              )}
            </div>
          </section>
        </div>
      </main>
  )
};

export default Auth;