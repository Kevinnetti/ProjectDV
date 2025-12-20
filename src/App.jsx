import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Card, CardContent, Button, Grid } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';

function App() {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      
      {/* HEADER / NAVBAR */}
      <AppBar position="static" sx={{ bgcolor: '#1a1a1a' }}>
        <Toolbar>
          <ArticleIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            YEMEN: L'ECLISSI DELL'UMANITÀ
          </Typography>
          <Button color="inherit">Intro</Button>
          <Button color="inherit">Dati</Button>
        </Toolbar>
      </AppBar>

      {/* HERO SECTION (Intro) */}
      <Box sx={{ py: 8, bgcolor: 'white', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
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
        <Section title="1. Il Crollo Economico" description="Come il PIL è crollato dimezzando la ricchezza del paese." />

        {/* Sezione 2: Raid Aerei */}
        <Section title="2. La Guerra Aerea" description="Analisi dei target civili vs militari nei bombardamenti." />

        {/* Sezione 3: Sfollati */}
        <Section title="3. Stranieri in Patria" description="Il movimento di milioni di persone intrappolate nei confini." />

        {/* Sezione 4: Fame */}
        <Section title="4. Geografia della Fame" description="Mappa dell'insicurezza alimentare (IPC Phases)." />

        {/* Sezione 5: Bilancio Finale */}
        <Section title="5. Il Bilancio Silenzioso" description="Morti dirette vs morti indirette: il vero costo della guerra." />

      </Container>

      {/* FOOTER */}
      <Box sx={{ py: 4, bgcolor: '#1a1a1a', color: 'white', textAlign: 'center' }}>
        <Typography variant="body2">
          ProjectDV - Visualizzazione Dati | Università [Tua Università]
        </Typography>
      </Box>
    </Box>
  );
}

// Un componente riutilizzabile per le sezioni
function Section({ title, description }) {
  return (
    <Card sx={{ mb: 4, elevation: 3 }}>
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" gutterBottom sx={{ color: '#d32f2f' }}>
              {title}
            </Typography>
            <Typography variant="body1" paragraph>
              {description}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Inserire qui il testo di approfondimento...
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            {/* Qui andrà il grafico */}
            <Box sx={{ height: 300, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                [SPAZIO PER LA VISUALIZZAZIONE]
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default App;