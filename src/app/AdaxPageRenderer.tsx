import { RetailResultReviewPage } from "../components/retail/RetailResultReviewPage";
import { RetailSettlementPage } from "../components/retail/RetailSettlementPage";
import { adaxScenarioMeta } from "../data/adaxScenarioMeta";
import { AboutPage } from "../pages/AboutPage";
import { HomePage } from "../pages/HomePage";
import { ModeSelectionPage } from "../pages/ModeSelectionPage";
import { RecordsPage } from "../pages/RecordsPage";
import { RolePage } from "../pages/RolePage";
import { ScenarioPage } from "../pages/ScenarioPage";
import { WorkspacePage } from "../pages/WorkspacePage";
import type { useAdaxTrainingSession } from "./useAdaxTrainingSession";

type AdaxTrainingSession = ReturnType<typeof useAdaxTrainingSession>;

export function AdaxPageRenderer({ session }: { session: AdaxTrainingSession }) {
  if (session.currentPage === "home") {
    return (
      <HomePage
        records={session.records}
        scenario={adaxScenarioMeta}
        onStart={() => session.navigate("start")}
        onRecords={() => session.navigate("records")}
      />
    );
  }

  if (session.currentPage === "about") {
    return <AboutPage />;
  }

  if (session.currentPage === "start") {
    return <ModeSelectionPage records={session.records} onChooseMode={session.chooseTrainingMode} />;
  }

  if (session.currentPage === "scenario" && session.mode) {
    return <ScenarioPage mode={session.mode} onNext={() => session.navigate("role")} />;
  }

  if (session.currentPage === "role" && session.mode) {
    return (
      <RolePage
        mode={session.mode}
        selectedRole={session.selectedRole}
        onSelectRole={session.selectTrainingRole}
        onNext={() => session.navigate("strategy")}
      />
    );
  }

  if (session.currentPage === "strategy" && session.mode) {
    return (
      <WorkspacePage
        mode={session.mode}
        retailTrainingState={session.retailTrainingState}
        retailSettlement={session.retailDomainSettlement}
        retailValidationErrors={session.retailTrainingValidation.errors}
        executionResultGenerated={session.executionResultGenerated}
        templateMessage={session.templateMessage}
        onTemplateMessage={session.setTemplateMessage}
        onRetailTrainingStateChange={session.updateRetailTrainingState}
        onGenerateExecutionResult={session.generateExecutionResult}
        materials={session.materials}
        saved={session.recordSaved}
        onMaterialChange={session.updateMaterial}
        onSaveReviewRecord={session.saveReviewRecord}
        onRecords={() => session.navigate("records")}
        onHome={() => session.navigate("home")}
        onNext={() => session.navigate("settlement")}
      />
    );
  }

  if (session.currentPage === "settlement" && session.mode === "execution") {
    return (
      <RetailSettlementPage
        result={session.retailDomainSettlement}
        validationErrors={session.retailTrainingValidation.errors}
        onBack={() => session.navigate("strategy")}
        onNext={() => session.navigate("review")}
      />
    );
  }

  if (session.currentPage === "review" && session.mode === "execution") {
    return (
      <RetailResultReviewPage
        result={session.retailDomainSettlement}
        saved={session.recordSaved}
        onSave={session.saveExecutionRecord}
        onRetry={() => session.navigate("strategy")}
        onRecords={() => session.navigate("records")}
        onHome={() => session.navigate("home")}
      />
    );
  }

  if (session.currentPage === "records") {
    return (
      <RecordsPage
        records={session.records}
        onStart={() => session.navigate("start")}
        onClearRecords={session.clearTrainingRecords}
        onRevisitRecord={session.revisitTrainingRecord}
      />
    );
  }

  return null;
}
