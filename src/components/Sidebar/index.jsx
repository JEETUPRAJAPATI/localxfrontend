// src/components/Sidebar.js
import { memo } from 'react';
import { connect } from 'react-redux';
import { Nav } from 'react-bootstrap';
import './sidebar.scss';

const Sidebar = () => {
  return (
    <Nav className='col-md-3 d-md-block bg-light sidebar'>
      <Nav.Item>
        <Nav.Link href='#dashboard'>Dashboard</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href='#settings'>Settings</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href='#profile'>Profile</Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

// Updated to use an underscore to prevent unused variable warning
const mapStateToProps = (_state) => {
  return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(memo(Sidebar));
