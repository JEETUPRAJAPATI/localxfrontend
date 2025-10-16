"use client";

import { Container } from 'react-bootstrap';
import HomeNavigation from '@/components/VisitorPanel/HomeNavigation';
import HomeTopLogo from '@/components/VisitorPanel/HomeTopLogo';
import HomeTopNotice from '@/components/VisitorPanel/HomeTopNotice';
import styles from '@/styles/home.module.scss';
import HomeCountriesDir from './HomeCountriesDir';
import HomeContent from './HomeContent';
import Partners from '@/components/Partners';
import SponserSites from '@/components/SponserSites';
import Footer from '@/components/Footer';

function Home() {

  return (
    <div className={styles.homePage}>
      <div className={styles.pageWrapper}>
        <Container className={styles.homeCnt}>
          <HomeTopLogo />
          <HomeTopNotice />
          <HomeNavigation />
          <div className={styles.countriesDir}>
            <HomeCountriesDir />
          </div>
          <HomeContent />
        </Container>
        <Partners className="mt-4" />
        <SponserSites className="mt-4" />
      </div>
      <Footer className={`bottom-fixed ${styles.homeFooter} mt-4`} />
    </div>
  );
}

Home.propTypes = {};

export default Home;
