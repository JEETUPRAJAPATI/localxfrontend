import { memo } from 'react';
import { connect } from 'react-redux';

import './header.scss';

const Header = () => {
  // const { theme, toggleTheme } = useContext(ThemeContext);

  //   return (
  //     <Navbar bg={theme === 'light' ? 'light' : 'dark'} variant={theme === 'light' ? 'light' : 'dark'}>
  //       <Container>
  //         <Navbar.Brand href="#home">MyApp</Navbar.Brand>
  //         <Nav className="me-auto">
  //           <Nav.Link href="#home">Home</Nav.Link>
  //           <Nav.Link href="#features">Features</Nav.Link>
  //           <Nav.Link href="#pricing">Pricing</Nav.Link>
  //         </Nav>
  //         <button className="btn btn-outline-primary" onClick={toggleTheme}>
  //           Toggle Theme
  //         </button>
  //       </Container>
  //     </Navbar>
  //   );
  return null;
};

const mapStateToProps = (_state) => {
  return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(memo(Header));
