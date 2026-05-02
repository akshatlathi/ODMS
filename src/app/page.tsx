import SurveyContainer from "../components/SurveyContainer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <SurveyContainer />
    </main>
  );
}
