import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import PageForm from '../components/page-form';

const theme = createTheme({});


export default function Index() {
  return (
    <MantineProvider theme={theme} defaultColorScheme='dark'>
      <PageForm />
    </MantineProvider>
  )
}
