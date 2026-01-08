import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, Grid, Fab, IconButton, Menu, MenuItem } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import GdpLineChartD3 from './components/GdpLineChartD3';
import FlowMapD3 from './components/FlowMapD3';
import MigrationGroupedChart from './components/MigrationGroupedChart';
import Raid from './components/Raid';
import Food from './components/food';
import Fatalities from './components/Fatalities';
import MapDis from './components/mapdis';
import Donut from './components/Donut';

function App() {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [navAnchorEl, setNavAnchorEl] = useState(null);
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

      {/* HERO SECTION (Intro) */}
      <Box id="intro" sx={{ py: 8, bgcolor: 'darkred', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#f5f5f5' }}>
            The Forgotten War
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph sx={{ color: '#f5f5f5' }}>
            Yemen is often described as a 'forgotten war'. Crushed between regional powers, the poorest country on the Arabian Peninsula has faced a devastating conflict since 2014. What you will see while scrolling are not just numbers: they are the scars of a nation. From air raids that reshaped cities to economic collapse that emptied tables, and the desperate flight of millions.This is the story of how Yemen was driven to the brink.
            </Typography>
        </Container>
      </Box>

      {/* SEZIONI DEL PROGETTO (Le 5 visualizzazioni) */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        
        {/* Sezione 1: Raid Aerei (scambiata con GDP) */}
        <Section 
          id="raid" 
          title="1. Air Warfare" 
          description="Air raids that devastated Yemen between 2015 and 2025." 
          body={
    <div style={{ textAlign: 'justify'  }}>
      If we look at where the bombs fell, a stark and brutal fracture emerges. The map of Yemen is not painted uniformly; the silence was not distributed equally.
      While the eastern desert regions remain largely grey-untouched by the air war the western part of the country, where the vast majority of the population lives, burns in warm colors, darkening into black.
      For millions of civilians living in these districts, the sound of aircraft became the daily soundtrack of their lives for several years.
      For seven years, Yemen's skies have been synonymous with fear. The Yemen Data Project records every air raid carried out by the Saudi-led Coalition and the UAE between March 2015 and April 2022.
    </div>
  }> 
    <Raid/>
    <Box sx={{ maxWidth: '640px', mx: 'auto', my: 4, textAlign: 'justify' }}>
             <Typography variant="body1" component="div" sx={{ color: '#301111ff' }}>
              Once we understand where the raids struck, we must ask what they hit. The answer, visualized in this chart, paints a picture of chaos and systemic collapse.
              The Fog of War: The most striking feature is the massive blue arc representing the "Unknown" (10,174 raids). 
              Nearly 40% of all airstrikes have no clear identification in the records. This is the terrifying ambiguity of modern warfare: thousands of explosions with no name.
              The Civilian Toll: While "Military Security Targets" (in orange) make up a large portion, the remaining slices tell the story of a nation being dismantled. Over 3,100 raids directly hit civilian locations.
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
    <div style={{ textAlign: 'justify' }}>
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
          description="The Color of Desperation: Mapping Food Insecurity in Yemen" 
              body={
            <div style={{ textAlign: 'justify' }}>
          If the GDP chart showed the cause, this map shows the consequence. 
          After a decade of conflict and economic paralysis, the map of Yemen is no longer defined by administrative borders, but by levels of hunger.
          The visualization is dominated by two colors: Orange (Crisis) and Red (Emergency). There is almost no green left.
          The vast orange expanse covers the majority of the country. This represents about 34% of the analyzed population, nearly 12,2 millions of people,
          living in "Crisis" (Phase 3). These are families who are skipping meals and selling their last assets just to eat.
          The situation is even more critical in the western districts, visible as deep red patches. Here, 5,4 million people face "Emergency" conditions (Phase 4).
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
            <div style={{ textAlign: 'justify' }}>
          When war destroys your home, you seek shelter. But the tragedy in Yemen is that most people cannot leave the country.

        The chart compares internally displaced persons (IDPs) with refugees abroad from 2011 to today. The imbalance is clear: millions are IDPs, trapped in open-air confinement, forced to move from one combat zone to another without ever finding true safety.
          </div>
          }>
          <FlowMapD3 />
          <Box sx={{ maxWidth: '640px', mx: 'auto', my: 4, textAlign: 'justify' }}>
             <Typography variant="body1" component="div" sx={{ color: '#301111ff' }}>
              If the map shows the few who left, this chart reveals the millions who remained. It illustrates a nation turned into an open-air prison.

The graph compares Internally Displaced Persons (IDPs) in red against External Refugees in black. The visual imbalance is devastating.
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
    <div style={{ textAlign: 'justify' }}>
      How many deaths has the war caused? The answer is more complex than counting bodies on battlefields. According to UN estimates, the conflict has caused hundreds of thousands of casualties.

The shocking detail is the cause: about 60% of these deaths are not due to direct violence (bombing or shootings), but to indirect causes contaminated water, cholera, lack of medicine and malnutrition. The war in Yemen has killed more children through hunger than soldiers with bullets.
    </div>
  }>
      
          <Fatalities />
          
        </Section>

      </Container>

      {/* FOOTER */}
      <Box sx={{ py: 4, bgcolor: '#1a1a1a', color: 'white', textAlign: 'center' }}>
         <Typography variant="body1">
          Data Visualization Project 2025/2066 - University of Genoa
          <br />
          Nettikadan Kevin 
        </Typography>
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