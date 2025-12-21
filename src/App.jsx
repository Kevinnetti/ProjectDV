import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, Grid, Fab } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function App() {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const sections = [
    { id: 'gdp', label: 'Crollo Economico' },
    { id: 'raid', label: 'Guerra Aerea' },
    { id: 'sfollati', label: 'Stranieri in Patria' },
    { id: 'fame', label: 'Geografia della Fame' },
    { id: 'bilancio', label: 'Bilancio Silenzioso' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Mostra il pulsante scroll-to-top dopo la sezione intro
      const introElement = document.getElementById('intro');
      if (introElement) {
        const introBottom = introElement.offsetTop + introElement.offsetHeight;
        setShowScrollTop(scrollPosition > introBottom);
      }
      
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      })).filter(s => s.element);

      const sectionScrollPosition = scrollPosition + 200;

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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      
      {/* HEADER / NAVBAR */}
      <Box sx={{ pt: 2, px: 2, display: 'flex', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 9999 }}>
        <AppBar 
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
              <Typography variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                YEMEN: L'ECLISSI DELL'UMANITÀ
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
          body="Tra il 2014 e il 2023 il PIL reale si è quasi dimezzato: salari pubblici sospesi, inflazione e svalutazione hanno eroso il potere d'acquisto, trasformando la crisi economica in crisi umanitaria." 
        />

        {/* Sezione 2: Raid Aerei */}
        <Section 
          id="raid" 
          title="2. La Guerra Aerea" 
          description="Analisi dei target civili vs militari nei bombardamenti." 
          body="Mercati, scuole e ospedali sono stati colpiti insieme a obiettivi militari. Il rapporto tra target civili e militari mostra quanto spesso la popolazione sia finita nel fuoco incrociato." 
        />

        {/* Sezione 3: Sfollati */}
        <Section 
          id="sfollati" 
          title="3. Stranieri in Patria" 
          description="Il movimento di milioni di persone intrappolate nei confini." 
          body="Oltre 4 milioni di yemeniti hanno abbandonato le proprie case restando entro i confini nazionali. Gli sfollati interni vivono in campi informali con accesso limitato ad acqua, lavoro e istruzione." 
        />

        {/* Sezione 4: Fame */}
        <Section 
          id="fame" 
          title="4. Geografia della Fame" 
          description="Mappa dell'insicurezza alimentare (IPC Phases)." 
          body="La mappa IPC evidenzia aree in emergenza (Fase 4) e in catastrofe (Fase 5). La carestia è stata evitata dagli aiuti, ma la dipendenza esterna e i prezzi interni rendono fragile ogni miglioramento." 
        />

        {/* Sezione 5: Bilancio Finale */}
        <Section 
          id="bilancio" 
          title="5. Il Bilancio Silenzioso" 
          description="Morti dirette vs morti indirette: il vero costo della guerra." 
          body="Alle vittime dirette dei combattimenti si sommano quelle indirette: malnutrizione, epidemie e crollo dei servizi sanitari. Il bilancio reale supera di molto quello conteggiato dalle sole azioni militari." 
        />

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
function Section({ id, title, description, body }) {
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
          <Typography variant="body2" sx={{ color: '#777' }}>
            {body}
          </Typography>
        </Box>
      </Box>

      {/* Area grafico a tutta larghezza */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ height: 360, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            [SPAZIO PER LA VISUALIZZAZIONE]
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default App;