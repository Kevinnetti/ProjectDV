import React from 'react';
import { Box, Container, Typography, Link, Button } from '@mui/material';

const DataSources = ({ onClose }) => {
  // Build runtime URLs to data files included in the repo using Vite import.meta.url
  const unifiedCsv = new URL('../data/Yemen_Data_Project_Unified.csv', import.meta.url).toString();
  const fatalitiesCsv = new URL('../data/fatalities.csv', import.meta.url).toString();
  const gdpCsv = new URL('../data/gdp.csv', import.meta.url).toString();
  const idpCsv = new URL('../data/idp.csv', import.meta.url).toString();
  const migrationsCsv = new URL('../data/migrations.csv', import.meta.url).toString();
  const raidsCsv = new URL('../data/raids.csv', import.meta.url).toString();
  const districtsJson = new URL('../data/yemen_districts_clean.json', import.meta.url).toString();

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 700 }}>Data and Sources</Typography>
          <Button variant="contained" size="large" onClick={onClose} sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}>Home Page </Button>
        </Box>

        <Typography variant="body1" paragraph>
          Below are the sources and descriptions of the datasets used in this project.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Yemen Data Project</Typography>
          <Typography variant="body2" paragraph>
            Source files : <Link href="https://yemendataproject.org/data/" target="_blank" rel="noopener">Yemen Data Project</Link>
          </Typography>
          <Typography variant="body2" paragraph>
            Used fields: date, Incident ID, Main category and District
            <br />
            Purpose: display raid incidents over time on the map and the categories in the Donut Chart.
            <br />
            Methodology I unified and cleaned the raw CSV data into a single file (<Link href={unifiedCsv} target="_blank" rel="noopener">Yemen_Data_Project_Unified.csv</Link>) for easier processing by the python script Raid_unifier.py available in the project repo. 
            I used the merge_data.py script to aggregate raid counts per district/year for the choropleth map.
            GeoJSON used for mapping: <Link href={districtsJson} target="_blank" rel="noopener">yemen_districts_clean.json</Link>
          
            </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">GDP of Yemen</Typography>
          <Typography variant="body2" paragraph>
            Source file : <Link href="https://www.imf.org/external/datamapper/NGDPD@WEO/YEM?zoom=YEM&highlight=YEM" target="_blank" rel="noopener">International Monetary Fund</Link>
          </Typography>
          <Typography variant="body2" paragraph>
           Used fields: `Year`, `GDP`.
           <br />
           Purpose: display the national GDP trend over time as the GdpLineChart.
           </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">IPC</Typography>
          <Typography variant="body2" paragraph>
            Source file : <Link href="https://www.ipcinfo.org/ipc-country-analysis/details-map/en/c/1159662/" target="_blank" rel="noopener">IPC</Link>
          </Typography>
          <Typography variant="body2" paragraph>
            Used fields: features, geometry.
            <br />
            Purpose: display the food insecurity map as the ChoroplethMap component.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">IDP and Migration data</Typography>
          <Typography variant="body2" paragraph>
            Source file IDP : <Link href="https://www.unhcr.org/refugee-statistics/download?data_finder%5BdataGroup%5D=displacement&data-finder=on&data_finder%5Bdataset%5D=idp&data_finder%5BdisplayType%5D=totals&data_finder%5Byear__filterType%5D=range&data_finder%5Byear__rangeFrom%5D=2007&data_finder%5Byear__rangeTo%5D=2025&data_finder%5Bcoo__displayType%5D=custom&data_finder%5Bcoo__country%5D%5B%5D=211&data_finder%5Byear__%5D=&data_finder%5Bcoo__%5D=&data_finder%5Badvanced__%5D=&data_finder%5Bsubmit%5D=" target="_blank" rel="noopener">UNHCR</Link><br />
            Source file Migrations : <Link href="https://www.unhcr.org/refugee-statistics/download?data_finder%5BdataGroup%5D=displacement&data_finder%5Bdataset%5D=population&data_finder%5BdisplayType%5D=totals&data_finder%5BpopulationType%5D%5B0%5D=REF&data_finder%5BpopulationType%5D%5B1%5D=ASY&data_finder%5BpopulationType%5D%5B2%5D=IDP&data_finder%5BpopulationType%5D%5B3%5D=OIP&data_finder%5BpopulationType%5D%5B4%5D=STA&data_finder%5BpopulationType%5D%5B5%5D=HST&data_finder%5BpopulationType%5D%5B6%5D=OOC&data_finder%5Byear__filterType%5D=range&data_finder%5Byear__rangeFrom%5D=2007&data_finder%5Byear__rangeTo%5D=2025&data_finder%5Bcoo__displayType%5D=custom&data_finder%5Bcoo__country%5D%5B0%5D=211&data_finder%5Bcoa__displayType%5D=all&data_finder%5Byear__%5D=&data_finder%5Bcoo__%5D=&data_finder%5Bcoa__%5D=&data_finder%5Badvanced__%5D=&data_finder%5Bsubmit%5D=&data-finder=on&page=1" target="_blank" rel="noopener">UNHCR</Link>
          </Typography>
          <Typography variant="body2" paragraph>
            Used fields: <br /> -       On IDP "Year,"Country of Origin" and "Total" for the IDPLineChart; <br /> -     On Migrations "Year," "Country of Origin," "Country of Asylum," and "Total" for the FlowMap.
            <br />
            Purpose: display IDP trends over time as the MigrationGroupedChart and migration flows as the FlowMap component.
            </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Acled </Typography>
          <Typography variant="body2" paragraph>
            Source file : <Link href="https://acleddata.com/" target="_blank" rel="noopener">ACLED </Link><br />
           </Typography>
          <Typography variant="body2" paragraph>
            Used fields:  fatalities, admin1.
            <br />
            Purpose: display fatalities by governorates as the Fatalities.
          </Typography>
        </Box>

        
      </Container>
    </Box>
  );
};

export default DataSources;
