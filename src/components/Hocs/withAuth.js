import { useSelector } from 'react-redux';

const withAuth = (WrappedComponent) => {
  const AuthHOC = (props) => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // Redirect to login page if not logged in
    if (!isLoggedIn) {
      // Replace with your own redirection logic
      // e.g. history.push("/login");
      return <div>Please login to access this page.</div>;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthHOC;
};

export default withAuth;
