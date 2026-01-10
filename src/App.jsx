import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, Grid, Fab, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CloseIcon from '@mui/icons-material/Close';
import GdpLineChartD3 from './components/GdpLineChartD3';
import FlowMapD3 from './components/FlowMapD3';
import MigrationGroupedChart from './components/MigrationGroupedChart';
import Raid from './components/Raid';
import Food from './components/food';
import Fatalities from './components/Fatalities';

import Donut from './components/Donut';
import DataSources from './components/DataSources';
import PeninsulaMap from './components/PeninsulaMap';

function App() {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [navAnchorEl, setNavAnchorEl] = useState(null);
  const [showDataPage, setShowDataPage] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [showMobileBanner, setShowMobileBanner] = useState(false);

  useEffect(() => {
    setShowMobileBanner(Boolean(isMobile));
  }, [isMobile]);

  const closeMobileBanner = () => setShowMobileBanner(false);
  const getHeaderOffset = () => {
    const navEl = document.getElementById('top-nav');
    return navEl ? navEl.getBoundingClientRect().height + 15 : 0;
  };
  
  const sections = [
    { id: 'intro', label: 'YEMEN: THE ECLIPSE OF HUMANITY' },
    { id: 'raid', label: 'Air Warfare' },
    { id: 'gdp', label: 'Economic Collapse' },
    { id: 'fame', label: 'Geography of Hunger' },
    { id: 'sfollati', label: 'Displacement' },
    { id: 'bilancio', label: 'The Silent Toll' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const headerOffset = getHeaderOffset();
      
      // Mostra il pulsante scroll-to-top dopo la sezione intro
      const introElement = document.getElementById('intro');
      if (introElement) {
        const introBottom = introElement.offsetTop + introElement.offsetHeight;
        setShowScrollTop(scrollPosition > introBottom);
      }
      
      const sectionElements = sections
        .map(s => ({ id: s.id, element: document.getElementById(s.id) }))
        .filter(s => s.element);

      const sectionScrollPosition = scrollPosition + (window.innerHeight / 2) - headerOffset;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.element.offsetTop <= sectionScrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = getHeaderOffset();
    const elementPosition = el.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#ebdadaff', minHeight: '100vh' }}>
      
      {/* HEADER / NAVBAR */}
      {!showDataPage && (
        <Box sx={{ pt: 2, px: 2, display: 'flex', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 9999 }}>
        <AppBar 
          id="top-nav"
          position="static" 
          sx={{ 
            bgcolor: '#1a1a1a', 
            borderRadius: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            maxWidth: '900px',
            width: '100%'
          }}
        >
          <Toolbar sx={{ px: 3, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ArticleIcon sx={{ mr: 2 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{ fontSize: '1rem', cursor: 'pointer' }}
                onClick={() => handleScrollTo('intro')}
              >
                
              </Typography>
            </Box>
            {/* Mobile menu icon (shown on xs) */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={(e) => setNavAnchorEl(e.currentTarget)}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
              aria-label="open navigation menu"
            >
              <MenuIcon />
            </IconButton>

            {/* Desktop buttons (hidden on xs) */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              {sections.map((section) => (
                <Button 
                  key={section.id} 
                  color="inherit" 
                  onClick={() => handleScrollTo(section.id)}
                  sx={{
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.5,
                    color: activeSection === section.id ? '#d32f2f' : 'white',
                    fontWeight: activeSection === section.id ? 'bold' : 'normal',
                    borderBottom: activeSection === section.id ? '2px solid #d32f2f' : 'none',
                    borderRadius: 0,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {section.label}
                </Button>
              ))}
            </Box>
            
            {/* Mobile menu dropdown */}
            <Menu
              anchorEl={navAnchorEl}
              open={Boolean(navAnchorEl)}
              onClose={() => setNavAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {sections.map((section) => (
                <MenuItem
                  key={section.id}
                  onClick={() => { setNavAnchorEl(null); handleScrollTo(section.id); }}
                  selected={activeSection === section.id}
                >
                  {section.label}
                </MenuItem>
              ))}
            </Menu>
          </Toolbar>
          </AppBar>
        </Box>
      )}

      {isMobile && showMobileBanner && (
        <Box sx={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <Box sx={{ width: '72%', height: '50vh', bgcolor: '#1a1a1a', color: '#fff', px: 3, py: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 2, position: 'relative' }}>
            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
              For the best chart experience, please use a desktop computer.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem', color: '#ddd', maxWidth: '36rem' }}>
              Charts are more readable on larger screens. For optimal clarity and interaction, we recommend viewing this site on a PC.
            </Typography>
            <IconButton size="large" color="inherit" onClick={closeMobileBanner} aria-label="close banner" sx={{ position: 'absolute', top: 12, right: 12, color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* INTRO SECTION */}
      <Box id="intro" sx={{ py: 8, bgcolor: 'darkred', borderBottom: '1px solid #ddd' }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  color: '#f5f5f5',
                  textAlign: 'left',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                  lineHeight: 1.1,
                  overflowWrap: 'break-word'
                }}
              >
                The Forgotten War
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  color: '#f5f5f5',
                  textAlign: 'left',
                  mb: 2,
                  fontSize: { xs: '0.95rem', md: '1.05rem' }
                }}
              >
                Yemen is often described as a 'forgotten war'. Crushed between regional powers, the poorest country on the Arabian Peninsula has faced a devastating conflict since 2014. What you will see while scrolling are not just numbers: they are the scars of a nation. From air raids that reshaped cities to economic collapse that emptied tables, and the desperate flight of millions. This is the story of how Yemen was driven to the brink.
              </Typography>
            </Box>

            <Box
              sx={{
                width: { xs: '100%', sm: '70%', md: 360 },
                flex: { xs: '0 0 auto', md: '0 0 360px' },
                maxWidth: { xs: '100%', md: 360 },
                alignSelf: 'center',
                transform: { xs: 'none', md: 'translateY(6px)' },
                mt: { xs: 2, md: 0 }
              }}
            >
              <PeninsulaMap />
            </Box>
          </Box>
        </Container>
      </Box>

        {/* SEZIONI DEL PROGETTO (Le 5 visualizzazioni) */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {showDataPage ? (
          <DataSources onClose={() => setShowDataPage(false)} />
        ) : (<>
        
        {/* Sezione 1: Raid Aerei (scambiata con GDP) */}
        <Section 
          id="raid" 
          title="1. Air Warfare" 
          description="Air raids that devastated Yemen between 2015 and 2025." 
          body={
    <div style={{ textAlign: 'left'  }}>
      If we look at where the bombs fell, a stark and brutal fracture emerges. The map of Yemen is not painted uniformly.
      While the eastern desert regions remain largely grey-untouched by the air war the western part of the country, where the vast majority of the population lives, burns in warm colors, darkening into black.
      For millions of civilians living in these districts, the sound of aircraft became the daily soundtrack of their lives for several years.
      For years, Yemen's skies have been synonymous with fear. The Yemen Data Project records every air raid carried out by the Saudi-led Coalition and the UAE between March 2015 and April 2022 then every air raid carried out by US/UK and Israel from January 2024 to September 2025. 
    </div>
  }> 
    <Raid/>
  
    <Box sx={{ maxWidth: '640px', mx: 'auto', my: 4, textAlign: 'left' }}>
             <Typography variant="body1" component="div" sx={{ color: '#301111ff' }}>
              Once we understand where the raids struck, we must ask what they hit. The answer, visualized in this chart, paints a picture of chaos and systemic collapse.
              The most striking feature is the massive blue arc representing the "Unknown" (10,174 raids). 
              Nearly 40% of all airstrikes have no clear identification in the records. This is the terrifying ambiguity of modern warfare: thousands of explosions with no name.
              While "Military Security Targets" (in orange) make up a large portion, the remaining slices tell the story of a nation being dismantled. Over 3,100 raids directly hit civilian locations.
              The data reveals a war fought against the very infrastructure of survival. With over 1,600 attacks on infrastructure, 1,500 on economic targets, 
              and hundreds of strikes on schools (400) and medical facilities (96), the air campaign didn't just target armed forces it targeted Yemen's ability to function as a state, long after the smoke cleared.
             
             </Typography>
          </Box>
    <Donut/>
    
  </Section>

        {/* Sezione 2: GDP (scambiata con Raid) */}
        <Section 
          id="gdp" 
          title="2. Economic Collapse" 
          description="How GDP fell and national wealth was halved." 
         body={
    <div style={{ textAlign: 'left' }}>
      Bombs destroy buildings, but the economy destroys the future. The chart shows Yemen's GDP from the 1990s to today. 
      Tracing the graph from the year 2000, we see a country on the rise. For over a decade, Yemen's economy was growing, reaching its peak around 2013-2014 with a GDP of over $40 billion.
      It was a period of fragile but tangible hope.
      Then, the war began, and the line collapses.
      The sharp drop visible on the chart represents a catastrophic economic shock. In just a few years following the outbreak of conflict, the national wealth was effectively halved.
      The graph plunges from its peak down to roughly $20 billion, reflecting the devastation caused by port blockades and the fracturing of the central bank.
      </div>
  }>
      
          <GdpLineChartD3 />
        </Section>

    

        {/* Sezione 3: Fame (scambiata con Sfollati) */}
        <Section 
          id="fame" 
          title="3. Geography of Hunger" 
          description="The Color of Desperation: Mapping Food Insecurity in Yemen in 2025" 
              body={
            <div style={{ textAlign: 'left' }}>
          If the GDP chart showed the cause, this map shows the consequence. 
          After a decade of conflict and economic paralysis, the map of Yemen is no longer defined by administrative borders, but by levels of hunger.
          The visualization is dominated by two colors: Orange (Crisis) and Red (Emergency). There is almost no green left.
          The vast orange expanse covers the majority of the country. This represents about 34% of the analyzed population, nearly 12.2 millions people,
          living in "Crisis" (Phase 3). These are families who are skipping meals and selling their last assets just to eat.
          The situation is even more critical in the western districts, visible as deep red patches. Here, 5.4 million people face "Emergency" conditions (Phase 4).
          This hunger is not an accident of nature; it is a convergence of shocks. The map's red zones align with areas hit hardest by conflict, economic collapse, and severe flash floods, stripping people of their last safety nets.
          </div>
          }>
      
          <Food />
        </Section>

        {/* Sezione 4: Sfollati (scambiata con Fame) */}
        <Section 
          id="sfollati" 
          title="4. Displacement" 
          description="Movement of millions trapped within the country's borders." 
              body={
            <div style={{ textAlign: 'left' }}>
            When we think of war, we often imagine mass exoduses across borders. 
            But this map reveals a different, quieter tragedy.
            Tracing the lines on the map, we see the paths of those who managed to leave Yemen.
            Unlike other global crises where millions pour into neighboring countries, Yemen's isolation
            has made escape nearly impossible for the average citizen.
            </div>
          }>
          <FlowMapD3 />
          <Box sx={{ maxWidth: '640px', mx: 'auto', my: 4, textAlign: 'left' }}>
             <Typography variant="body1" component="div" sx={{ color: '#301111ff' }}>
              If the map shows the few who left, this chart reveals the millions who remained. It illustrates a nation turned into an open-air prison.
              The graph compares Internally Displaced People (IDPs) in red against External Refugees in black. The visual imbalance is devastating.
              As the conflict escalated, the number of internally displaced people skyrocketed from a few hundred thousand in 2014 to over 2 million in a single year
              The black bars (refugees abroad) are barely visible compared to the towering red columns. By 2024-2025, over 4.5 million people are trapped inside the country. 
              These families are not finding safety; they are simply moving from one danger zone to another, unable to cross the border to true refuge.
              </Typography>
          </Box>
          <MigrationGroupedChart />  
        </Section>

        {/* Sezione 5: Bilancio Finale */}
  <Section 
          id="bilancio" 
          title="5. The Silent Toll" 
          description="Direct vs indirect deaths: the true cost of war." 
         body={
    <div style={{ textAlign: 'left' }}>
    How do you measure the death toll of a nation? The answer is far more complex and terrifying, than simply counting bodies on a battlefield.
    While the world watches the explosions, the true catastrophe of the war in Yemen happens in silence. According to UN estimates, the conflict has claimed hundreds of thousands of lives, but the shocking reality lies in the cause. 
    Approximately 60% of these deaths are not due to direct violence no bullets, no airstrikes. Instead, they are the victims of a collapsing state: children dying from preventable diseases like cholera, families succumbing to malnutrition, and patients lost because hospitals ran out of power or medicine. 
    The war has killed more people through hunger than through combat.
    <br />
    When violence does strike, it leaves a permanent scar. 
    This chart breaks down the recorded casualties by governorate, revealing exactly where the fighting has been most lethal.  
    At the top of the list, two governorates stand out with devastating parity. 
    Marib records the highest toll with 23,869 casualties, closely followed by Taizz with 23,737.
    Sadah, the heartland of the Houthi movement and a primary target for airstrikes, follows with 21,258 casualties.
    The length of these red bars represents not just statistics, but the systematic dismantling of communities across every corner of the country.
    </div>
  }>
      
          <Fatalities />
          
        </Section>
        <Box id="conclusione" sx={{ mb: 8 }}>
          <Box sx={{ maxWidth: '900px', mx: 'auto', textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#d32f2f', fontWeight: 700 }}>
              6.A Future in the Balance
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#301111ff' }}>
              Reflection 
            </Typography>
            <Box sx={{ maxWidth: '640px', mx: 'auto' }}>
              <Typography variant="body1" component="div" sx={{ color: '#301111ff', textAlign: 'left' }}>
              We started this narrative by calling Yemen the "Forgotten War." But after scrolling through the data, the reality is impossible to ignore.
              The story of Yemen is not just one of military strategy or regional politics; it is a story of systemic dismantling.
              We have seen how the violence began in the skies, with over 26,000 raids raining down on cities and deserts. We watched the economy flatline, erasing decades of growth and cutting the nation's wealth in half. We traced the path of millions trapped within their own borders, running from airstrikes only to face the slower, silent violence of hunger.

The charts end here, but the reality continues.

The tragedy of Yemen is that the damage shown in these visualizations will outlast the conflict itself. 
These numbers are not just statistics to be archived. They are a call to witness. Yemen may be geographically isolated, but the human cost revealed by this data demands that it no longer remains forgotten.
              </Typography>
            </Box>
          </Box>
        </Box>
        </>)}
      </Container>

      {/* FOOTER */}
      <Box sx={{ py: 4, bgcolor: '#1a1a1a', color: 'white', textAlign: 'center' }}>
         <Typography variant="body2" sx={{ mb: 1 }}>
          Data Visualization Project 2025/2066 - University of Genoa
          <br />
          Nettikadan Kevin 
        </Typography>
        <Button variant="text" size="small" onClick={() => setShowDataPage(true)} sx={{ color: '#fff', textDecoration: 'underline' }}>
          Data and Sources
        </Button>
      </Box>

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <Fab 
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            bgcolor: '#d32f2f',
            color: 'white',
            '&:hover': {
              bgcolor: '#b71c1c'
            },
            zIndex: 9998
          }}
          aria-label="scroll to top"
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </Box>
  );
}

// Un componente riutilizzabile per le sezioni
function Section({ id, title, description, body, children }) {
  return (
    <Box id={id} sx={{ mb: 8 }}>
      <Box sx={{ maxWidth: '900px', mx: 'auto', textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#d32f2f', fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ color: '#301111ff' }}>
          {description}
        </Typography>
        <Box sx={{ maxWidth: '640px', mx: 'auto' }}>
          <Typography variant="body1" component="div" sx={{ color: '#301111ff' }}>
            {body}
          </Typography>
        </Box>
      </Box>

      {/* Area grafico a tutta larghezza */}
      <Box sx={{ mt: 3 }}>
        {children ? (
          children
        ) : (
          <Box sx={{ height: 360, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Chart coming soon
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;