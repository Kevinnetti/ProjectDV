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
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      
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
      <Box id="intro" sx={{ py: 8, bgcolor: 'white', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            The Forgotten War
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
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
          description="Air raids that devastated Yemen between 2015 and 2022." 
          body={
    <div style={{ textAlign: 'justify' }}>
      For seven years, Yemen's skies have been synonymous with fear. The Yemen Data Project records every air raid carried out by the Saudi-led Coalition and the UAE between March 2015 and April 2022.

Not only military targets were hit: bridges, hospitals, schools and markets were struck in attempts to halt the Houthi advance. Although bombing decreased after the 2022 truce, the systematic destruction of infrastructure during this period set the stage for the country's collapse.
    </div>
  }> 
    <Raid/>
  
  </Section>

        {/* Sezione 2: GDP (scambiata con Raid) */}
        <Section 
          id="gdp" 
          title="2. Economic Collapse" 
          description="How GDP fell and national wealth was halved." 
         body={
    <div style={{ textAlign: 'justify' }}>
      Bombs destroy buildings, but the economy destroys the future. The chart shows Yemen's GDP from the 1990s to today. Notice the sharp drop after 2014: in less than a decade the economy was halved.

Port blockades, a split central bank and the collapse of the currency (Riyal) made goods scarce or unaffordable. Today even those who work struggle to buy basic food. Poverty is not an accident; it has become structural.

Between 2014 and 2023 real GDP nearly halved: public wages were suspended, inflation and devaluation eroded purchasing power, turning the economic crisis into a humanitarian crisis. The conflict has severely impacted the economy, limiting imports and worsening existing shocks.
    </div>
  }>
      
          <GdpLineChartD3 />
        </Section>

    

        {/* Sezione 3: Fame (scambiata con Sfollati) */}
        <Section 
          id="fame" 
          title="3. Geography of Hunger" 
          description="Map of food insecurity (IPC phases)." 
              body={
            <div style={{ textAlign: 'justify' }}>
          After a decade of war and economic collapse, this is the current result. The map shows IPC projections for 2025. You do not need to look far into the past to grasp the severity: red indicates areas where famine is imminent.

        With ports blocked and humanitarian aid struggling to reach people, millions of Yemenis face 'Emergency' or 'Catastrophe' phases. Hunger in Yemen is not caused by a global lack of food but by physical and economic barriers to access.
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
             <Typography variant="body2" component="div" sx={{ color: '#777' }}>
               Insert the intermediate text you want to show between the map and the bar chart. 
               For example, describe how the migration flows shown on the map translate into the specific numbers grouped by governorate in the chart below.
               This box uses the same style and width as the introductory text.
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
         <Typography variant="body2">
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
        <Typography variant="subtitle1" gutterBottom sx={{ color: '#555' }}>
          {description}
        </Typography>
        <Box sx={{ maxWidth: '640px', mx: 'auto' }}>
          <Typography variant="body2" component="div" sx={{ color: '#777' }}>
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
            <Typography variant="body2" color="text.secondary">
              Chart coming soon
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;