import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, Grid, Fab } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import GdpLineChartD3 from './components/GdpLineChartD3';
import FlowMapD3 from './components/FlowMapD3';

function App() {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const getHeaderOffset = () => {
    const navEl = document.getElementById('top-nav');
    return navEl ? navEl.getBoundingClientRect().height + 15 : 0;
  };
  
  const sections = [
    { id: 'intro', label: "YEMEN: L'ECLISSI DELL'UMANITÀ" },
    { id: 'gdp', label: 'Crollo Economico' },
    { id: 'raid', label: 'Guerra Aerea' },
    { id: 'sfollati', label: 'Stranieri in Patria' },
    { id: 'fame', label: 'Geografia della Fame' },
    { id: 'bilancio', label: 'Bilancio Silenzioso' },
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
            <Box sx={{ display: 'flex', gap: 1 }}>
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
          </Toolbar>
        </AppBar>
      </Box>

      {/* HERO SECTION (Intro) */}
      <Box id="intro" sx={{ py: 8, bgcolor: 'white', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            La Guerra Dimenticata
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Un viaggio attraverso i dati per comprendere la crisi umanitaria in Yemen: economia, bombe, fame e vite spezzate.
          </Typography>
        </Container>
      </Box>

      {/* SEZIONI DEL PROGETTO (Le 5 visualizzazioni) */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        
        {/* Sezione 1: GDP */}
        <Section 
          id="gdp" 
          title="1. Il Crollo Economico" 
          description="Come il PIL è crollato dimezzando la ricchezza del paese." 
         body={
    <div style={{ textAlign: 'justify' }}>
      Tra il 2014 e il 2023 il PIL reale si è quasi dimezzato: salari pubblici sospesi, 
      inflazione e svalutazione hanno eroso il potere d'acquisto, trasformando la crisi 
      economica in crisi umanitaria. Da quando sono scoppiate le violenze, le condizioni 
      della popolazione in Yemen sono rapidamente peggiorate, portando il Paese sull'orlo 
      della carestia e del collasso economico. Il conflitto in Yemen ha avuto un grave 
      impatto sull'economia del Paese, causando instabilità economiche, limitando le 
      importazioni e aggravando i disastri naturali. L'economia continua a deteriorarsi, 
      con perdite di mezzi di sussistenza e aumento dei prezzi delle materie prime. 
      La carenza di cibo, acqua potabile, servizi igienici e assistenza sanitaria, 
      nonché la diffusione di massicce epidemie di colera e difterite, hanno gravato 
      sulle condizioni di vita dei civili e privato le famiglie dei bisogni primari.
    </div>
  }>
      
          <GdpLineChartD3 />
        </Section>

        {/* Sezione 2: Raid Aerei */}
        <Section 
          id="raid" 
          title="2. La Guerra Aerea" 
          description="Analisi dei target civili vs militari nei bombardamenti." 
          body={
    <div style={{ textAlign: 'justify' }}>
      Tra il 2014 e il 2023 il PIL reale si è quasi dimezzato: salari pubblici sospesi, 
      inflazione e svalutazione hanno eroso il potere d'acquisto, trasformando la crisi 
      economica in crisi umanitaria. Da quando sono scoppiate le violenze, le condizioni 
      della popolazione in Yemen sono rapidamente peggiorate, portando il Paese sull'orlo 
      della carestia e del collasso economico. Il conflitto in Yemen ha avuto un grave 
      impatto sull'economia del Paese, causando instabilità economiche, limitando le 
      importazioni e aggravando i disastri naturali. L'economia continua a deteriorarsi, 
      con perdite di mezzi di sussistenza e aumento dei prezzi delle materie prime. 
      La carenza di cibo, acqua potabile, servizi igienici e assistenza sanitaria, 
      nonché la diffusione di massicce epidemie di colera e difterite, hanno gravato 
      sulle condizioni di vita dei civili e privato le famiglie dei bisogni primari.
    </div>
  }> </Section>

    

        {/* Sezione 3: Sfollati */}
        <Section 
          id="sfollati" 
          title="3. Stranieri in Patria" 
          description="Il movimento di milioni di persone intrappolate nei confini." 
          body={
    <div style={{ textAlign: 'justify' }}>
      Tra il 2014 e il 2023 il PIL reale si è quasi dimezzato: salari pubblici sospesi, 
      inflazione e svalutazione hanno eroso il potere d'acquisto, trasformando la crisi 
      economica in crisi umanitaria. Da quando sono scoppiate le violenze, le condizioni 
      della popolazione in Yemen sono rapidamente peggiorate, portando il Paese sull'orlo 
      della carestia e del collasso economico. Il conflitto in Yemen ha avuto un grave 
      impatto sull'economia del Paese, causando instabilità economiche, limitando le 
      importazioni e aggravando i disastri naturali. L'economia continua a deteriorarsi, 
      con perdite di mezzi di sussistenza e aumento dei prezzi delle materie prime. 
      La carenza di cibo, acqua potabile, servizi igienici e assistenza sanitaria, 
      nonché la diffusione di massicce epidemie di colera e difterite, hanno gravato 
      sulle condizioni di vita dei civili e privato le famiglie dei bisogni primari.
    </div>
  }>
          <FlowMapD3 />
        </Section>

        {/* Sezione 4: Fame */}
        <Section 
          id="fame" 
          title="4. Geografia della Fame" 
          description="Mappa dell'insicurezza alimentare (IPC Phases)." 
          body={
    <div style={{ textAlign: 'justify' }}>
      Tra il 2014 e il 2023 il PIL reale si è quasi dimezzato: salari pubblici sospesi, 
      inflazione e svalutazione hanno eroso il potere d'acquisto, trasformando la crisi 
      economica in crisi umanitaria. Da quando sono scoppiate le violenze, le condizioni 
      della popolazione in Yemen sono rapidamente peggiorate, portando il Paese sull'orlo 
      della carestia e del collasso economico. Il conflitto in Yemen ha avuto un grave 
      impatto sull'economia del Paese, causando instabilità economiche, limitando le 
      importazioni e aggravando i disastri naturali. L'economia continua a deteriorarsi, 
      con perdite di mezzi di sussistenza e aumento dei prezzi delle materie prime. 
      La carenza di cibo, acqua potabile, servizi igienici e assistenza sanitaria, 
      nonché la diffusione di massicce epidemie di colera e difterite, hanno gravato 
      sulle condizioni di vita dei civili e privato le famiglie dei bisogni primari.
    </div>
  }>
      
          <GdpLineChartD3 />
        </Section>

        {/* Sezione 5: Bilancio Finale */}
        <Section 
          id="bilancio" 
          title="5. Il Bilancio Silenzioso" 
          description="Morti dirette vs morti indirette: il vero costo della guerra." 
         body={
    <div style={{ textAlign: 'justify' }}>
      Tra il 2014 e il 2023 il PIL reale si è quasi dimezzato: salari pubblici sospesi, 
      inflazione e svalutazione hanno eroso il potere d'acquisto, trasformando la crisi 
      economica in crisi umanitaria. Da quando sono scoppiate le violenze, le condizioni 
      della popolazione in Yemen sono rapidamente peggiorate, portando il Paese sull'orlo 
      della carestia e del collasso economico. Il conflitto in Yemen ha avuto un grave 
      impatto sull'economia del Paese, causando instabilità economiche, limitando le 
      importazioni e aggravando i disastri naturali. L'economia continua a deteriorarsi, 
      con perdite di mezzi di sussistenza e aumento dei prezzi delle materie prime. 
      La carenza di cibo, acqua potabile, servizi igienici e assistenza sanitaria, 
      nonché la diffusione di massicce epidemie di colera e difterite, hanno gravato 
      sulle condizioni di vita dei civili e privato le famiglie dei bisogni primari.
    </div>
  }>
      
          <GdpLineChartD3 />
        </Section>

      </Container>

      {/* FOOTER */}
      <Box sx={{ py: 4, bgcolor: '#1a1a1a', color: 'white', textAlign: 'center' }}>
        <Typography variant="body2">
           Data Visualization Project 2025/2066 - Università di Genova
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
          aria-label="torna su"
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
              Grafico in arrivo
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;