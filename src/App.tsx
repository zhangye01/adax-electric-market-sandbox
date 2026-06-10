import { AdaxPageRenderer } from "./app/AdaxPageRenderer";
import { useAdaxTrainingSession } from "./app/useAdaxTrainingSession";
import { Layout } from "./components/Layout";

function App() {
  const session = useAdaxTrainingSession();

  return (
    <Layout
      currentPage={session.currentPage}
      mode={session.mode}
      canNavigate={session.canAccessPage}
      onNavigate={session.navigate}
    >
      <AdaxPageRenderer session={session} />
    </Layout>
  );
}

export default App;
