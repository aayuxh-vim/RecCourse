"""
Selenium Black Box Automated Functional Test Suite for RecCourse
================================================================
Target: RecCourse Web Application (http://localhost:3000)
Techniques: Equivalence Partitioning, Boundary Value Analysis, Error Guessing,
            State Transition Testing.
Execution: python tests/test_selenium.py
"""

import sys
import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

BASE_URL = "http://localhost:3000"
TIMESTAMP = int(time.time())
NEW_STUDENT_EMAIL = f"selenium_student_{TIMESTAMP}@reccourse.dev"
NEW_STUDENT_PASS = "ValidPass123!"
NEW_STUDENT_NAME = f"Test Student {TIMESTAMP % 1000}"


class RecCourseSeleniumTests(unittest.TestCase):
    """Automated Black Box Test Suite using Selenium WebDriver."""

    def setUp(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--window-size=1600,1200")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(8)
        self.wait = WebDriverWait(self.driver, 15)

    def tearDown(self):
        try:
            self.driver.quit()
        except Exception:
            pass

    def click_element(self, element):
        """Safely scroll to element and click."""
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
        time.sleep(0.3)
        try:
            element.click()
        except Exception:
            self.driver.execute_script("arguments[0].click();", element)

    def set_input_value(self, element, value):
        """Set React controlled input value reliably using prototype setter and event dispatch."""
        self.driver.execute_script("""
            const input = arguments[0];
            const value = arguments[1];
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(input, value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        """, element, value)
        time.sleep(0.2)

    def do_logout(self):
        """Perform clean session reset by clearing all cookies including HttpOnly."""
        try:
            self.driver.execute_cdp_cmd("Network.clearBrowserCookies", {})
            self.driver.execute_cdp_cmd("Network.clearBrowserCache", {})
            self.driver.execute_script("try { window.localStorage.clear(); window.sessionStorage.clear(); } catch(e) {}")
        except Exception:
            self.driver.delete_all_cookies()
        self.driver.get(f"{BASE_URL}/login")
        time.sleep(0.5)

    def do_login(self, email, password, role="STUDENT"):
        """Reliable helper to perform user login with hydration safety."""
        self.driver.get(f"{BASE_URL}/login")
        self.wait.until(EC.presence_of_element_located((By.ID, "email")))
        time.sleep(1.0)

        roles = self.driver.find_elements(By.CLASS_NAME, "role-option")
        if roles:
            target_idx = 1 if role == "FACULTY" and len(roles) >= 2 else 0
            for _ in range(6):
                self.click_element(roles[target_idx])
                time.sleep(0.3)
                if "selected" in roles[target_idx].get_attribute("class"):
                    break

        email_input = self.wait.until(EC.element_to_be_clickable((By.ID, "email")))
        self.set_input_value(email_input, email)

        pass_input = self.wait.until(EC.element_to_be_clickable((By.ID, "password")))
        self.set_input_value(pass_input, password)

        submit_btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']")))
        self.click_element(submit_btn)

    # ─────────────────────────────────────────────────────────────
    # TC-01: Valid Student Registration (BB-01: Valid EP)
    # ─────────────────────────────────────────────────────────────
    def test_01_valid_student_registration(self):
        """BB-01: Fill valid registration details and verify dashboard entry."""
        print("\n[RUNNING] TC-01: Valid Student Registration...")
        self.do_logout()
        self.driver.get(f"{BASE_URL}/register")

        self.wait.until(EC.presence_of_element_located((By.ID, "reg-name")))

        student_roles = self.driver.find_elements(By.CLASS_NAME, "role-option")
        if student_roles:
            self.click_element(student_roles[0])

        self.driver.find_element(By.ID, "reg-name").send_keys(NEW_STUDENT_NAME)
        self.driver.find_element(By.ID, "reg-email").send_keys(NEW_STUDENT_EMAIL)
        self.driver.find_element(By.ID, "reg-password").send_keys(NEW_STUDENT_PASS)

        tags = self.driver.find_elements(By.CSS_SELECTOR, ".tag")
        if len(tags) >= 2:
            self.click_element(tags[0])
            self.click_element(tags[1])

        submit_btn = self.driver.find_element(By.XPATH, "//button[@type='submit']")
        self.click_element(submit_btn)

        self.wait.until(EC.url_contains("/student"))
        self.assertIn("/student", self.driver.current_url)
        print("  [PASS] TC-01: Registration succeeded and redirected to /student dashboard")

    # ─────────────────────────────────────────────────────────────
    # TC-02: Duplicate Email Registration (BB-05: Error Guessing)
    # ─────────────────────────────────────────────────────────────
    def test_02_duplicate_email_registration(self):
        """BB-05: Registering with an existing email returns 409 duplicate error."""
        print("\n[RUNNING] TC-02: Duplicate Email Rejection...")
        self.do_logout()
        self.driver.get(f"{BASE_URL}/register")

        self.wait.until(EC.presence_of_element_located((By.ID, "reg-name")))
        self.driver.find_element(By.ID, "reg-name").send_keys("Duplicate User")
        self.driver.find_element(By.ID, "reg-email").send_keys(NEW_STUDENT_EMAIL)
        self.driver.find_element(By.ID, "reg-password").send_keys("AnyPass123!")

        submit_btn = self.driver.find_element(By.XPATH, "//button[@type='submit']")
        self.click_element(submit_btn)

        err_element = self.wait.until(
            EC.visibility_of_element_located((By.CLASS_NAME, "message-error"))
        )
        self.assertIn("already", err_element.text.lower())
        print("  [PASS] TC-02: Duplicate registration rejected with error message")

    # ─────────────────────────────────────────────────────────────
    # TC-03: Login with Incorrect Password (BB-08: Invalid EP)
    # ─────────────────────────────────────────────────────────────
    def test_03_login_wrong_password(self):
        """BB-08: Login with valid email but wrong password displays error."""
        print("\n[RUNNING] TC-03: Login Wrong Password...")
        self.do_logout()
        self.do_login(NEW_STUDENT_EMAIL, "WrongPass123!", role="STUDENT")

        err_element = self.wait.until(
            EC.visibility_of_element_located((By.CLASS_NAME, "message-error"))
        )
        self.assertTrue(len(err_element.text) > 0)
        print("  [PASS] TC-03: Wrong password rejected with visual alert")

    # ─────────────────────────────────────────────────────────────
    # TC-04: Login Persona Mismatch (Role Enforcement)
    # ─────────────────────────────────────────────────────────────
    def test_04_login_persona_mismatch(self):
        """BB-Role: Attempting to log in as Faculty with Student account is blocked."""
        print("\n[RUNNING] TC-04: Role Mismatch Rejection...")
        self.do_logout()
        self.do_login(NEW_STUDENT_EMAIL, NEW_STUDENT_PASS, role="FACULTY")

        err_element = self.wait.until(
            EC.visibility_of_element_located((By.CLASS_NAME, "message-error"))
        )
        self.assertTrue(len(err_element.text) > 0)
        print("  [PASS] TC-04: Server rejected student logging in under faculty persona")

    # ─────────────────────────────────────────────────────────────
    # TC-05: Valid Student Login (BB-07: Valid EP)
    # ─────────────────────────────────────────────────────────────
    def test_05_valid_student_login(self):
        """BB-07: Login with seeded student account redirects to /student."""
        print("\n[RUNNING] TC-05: Valid Student Login...")
        self.do_logout()
        self.do_login("student@reccourse.dev", "student123", role="STUDENT")

        self.wait.until(EC.url_contains("/student"))
        self.assertIn("/student", self.driver.current_url)

        page_title = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "page-title")))
        self.assertTrue(len(page_title.text) > 0)
        print(f"  [PASS] TC-05: Student logged in successfully ({page_title.text})")

    # ─────────────────────────────────────────────────────────────
    # TC-06: Course Catalog Browsing & Search (BB-11: Functional)
    # ─────────────────────────────────────────────────────────────
    def test_06_course_catalog_and_search(self):
        """BB-11: Course catalog displays cards and responds to search input."""
        print("\n[RUNNING] TC-06: Course Catalog Search...")
        self.do_login("student@reccourse.dev", "student123", role="STUDENT")
        self.wait.until(EC.url_contains("/student"))
        self.driver.get(f"{BASE_URL}/student/courses")
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "search-input")))

        search_input = self.driver.find_element(By.CLASS_NAME, "search-input")
        search_input.send_keys("Data")
        time.sleep(1.5)

        cards = self.driver.find_elements(By.CLASS_NAME, "course-card")
        self.assertGreater(len(cards), 0)
        print(f"  [PASS] TC-06: Catalog loaded and displayed {len(cards)} search results")

    # ─────────────────────────────────────────────────────────────
    # TC-07: Faculty Dashboard & Real Metrics (BB-13)
    # ─────────────────────────────────────────────────────────────
    def test_07_faculty_dashboard_and_classrooms(self):
        """BB-13: Faculty login redirects to /faculty and renders real stat metrics."""
        print("\n[RUNNING] TC-07: Faculty Dashboard & Real Metrics...")
        self.do_login("faculty@reccourse.dev", "faculty123", role="FACULTY")
        self.wait.until(EC.url_contains("/faculty"))
        self.assertIn("/faculty", self.driver.current_url)

        stats = self.wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "stat-card")))
        self.assertGreaterEqual(len(stats), 3)
        print(f"  [PASS] TC-07: Faculty dashboard rendered {len(stats)} genuine stat cards")


if __name__ == "__main__":
    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(RecCourseSeleniumTests)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
