import { Helmet } from 'react-helmet-async';

const HelmetMetadata = () => {
  // const location = useLocation();
  // const [meta, setMeta] = useState({
  //   title: "Localxlist",
  //   description: "Default Localxlist description",
  // });

  // useEffect(() => {
  //   fetch("/metadata.json")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const routeMeta = data[location.pathname] || data["/"];
  //       setMeta(routeMeta);
  //     })
  //     .catch((error) => console.error("Error loading metadata:", error));
  // }, [location.pathname]);

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>Find Male and Female Escorts Online - Casual Dating | Localxlist</title>
      <meta
        name='description'
        content='Localxlist.net is a Free casual dating and personal classified website. female escorts, male escorts, women for men, female massage services etc available here'
      />
      <meta
        name='keywords'
        content='backpage alternatives, backpage replacement, cityxguide alternatives, skipthegames, doublelist, backpage, Casual Dating Site Online, Female Escorts Online, Find Male Escorts Online, Platonic Dating, Birmingham Escorts, Birmingham Female Escorts, Chicago Female Escorts, Las Vegas Female Escorts, Find Female Escorts, Charlottesville Escorts, Iowa Female Escorts, Escort Girls Houston Tx, Charlotte Nc Female Escorts, Female Escorts Denver, Washington Female Escorts, local escorts, escort sites, escort website, cheap escorts, escort list'
      />
      <meta name='author' content='localxlist.net' />
      <link rel='canonical' href='https://localxlist.net/' />
      <link
        rel='icon'
        href='https://api.localxlist.net/uploads/backend/images/settings/favicon_15938438840.png'
      />

      {/* Open Graph (Facebook) Meta Tags */}
      <meta property='og:type' content='localxlist.net' />
      <meta
        property='og:title'
        content='Find Male and Female Escorts Online - Casual Dating | Localxlist'
      />
      <meta property='og:site_name' content='localxlist.net' />
      <meta
        property='og:description'
        content='Localxlist.net is a Free casual dating and personal classified website. female escorts, male escorts, women for men, female massage services etc available here'
      />
      <meta
        property='og:image'
        content='https://api.localxlist.net/uploads/backend/images/settings/header_logo_15854785210.png'
      />
      <meta property='og:image:height' content='377' />
      <meta property='og:url' content='https://localxlist.net/' />
      <meta property='fb:app_id' content='239031463576298' />

      {/* Twitter Meta Tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@localxlist' />
      <meta name='twitter:creator' content='@localxlist' />
      <meta
        name='twitter:title'
        content='Find Male and Female Escorts Online - Casual Dating | Localxlist'
      />
      <meta
        name='twitter:description'
        content='Localxlist.net is a Free casual dating and personal classified website. female escorts, male escorts, women for men, female massage services etc available here'
      />
      <meta
        name='twitter:image'
        content='https://api.localxlist.net/uploads/backend/images/settings/header_logo_15854785210.png'
      />
      <meta name='twitter:url' content='https://localxlist.net/' />

      {/* Other Meta Tags */}
      <meta name='generator' content='localxlist.net' />
      <meta name='yandex-verification' content='87591adb069fe964' />
    </Helmet>
  );
};

export default HelmetMetadata;
