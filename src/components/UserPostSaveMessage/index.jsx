import { faCheck } from "@fortawesome/free-solid-svg-icons"; // Import the check icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";

import { CREATE_POST_STEPS_USER_PANEL, ROUTES } from "@/utils/constant.js";
import Link from "next/link";
import { useRouter } from "next/router";

import FixedAuthHeader from "@/components/FixedAuthHeader";

const UserPostSaveMessage = () => {
  const router = useRouter();
  const { MESSAGE, CODE } = router.query;

  const [timeLeft, setTimeLeft] = useState(120); // Countdown duration
  const [isCooldown, setIsCooldown] = useState(true); // Button cooldown state

  useEffect(() => {
    // Redirect if CODE is missing
    // if (!CODE) {
    //   router.replace(CREATE_POST_STEPS_USER_PANEL[0]?.route || "/");
    //   return;
    // }
    const now = Date.now();
    const savedTime = localStorage.getItem("countdownEnd");
    let countdownEnd;

    // Initialize or restore countdown
    if (savedTime) {
      const remainingTime = Math.max(
        0,
        Math.floor((parseInt(savedTime) - now) / 1000)
      );
      setTimeLeft(remainingTime);
      setIsCooldown(remainingTime > 0);
      countdownEnd = parseInt(savedTime);
    } else {
      countdownEnd = now + timeLeft * 1000;
      localStorage.setItem("countdownEnd", countdownEnd);
    }

    // Skip timer if countdown is already complete
    if (countdownEnd <= now) {
      localStorage.removeItem("countdownEnd");
      setIsCooldown(false);
      setTimeLeft(0);
      return;
    }

    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem("countdownEnd");
          setIsCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [CODE, timeLeft]);

  return (
    <>
      <FixedAuthHeader />
      <div className="userPostSaveMessage">
        <Container className="msg-cnt text-center my-5">
          <div className="msg-cir">
            <FontAwesomeIcon icon={faCheck} size="4x" color="#fff" />
          </div>
          <p className="success-message">
            {MESSAGE || "Your Post Successfully Submitted..."}
          </p>
          <Button
            as={Link}
            href={ROUTES.userDashboard}
            variant="success"
            className="mx-1"
          >
            Continue
          </Button>
          <Button
            as={Link}
            href={CREATE_POST_STEPS_USER_PANEL[0]?.route || ""}
            variant="primary"
            className="mx-1"
            disabled={isCooldown}
          >
            {isCooldown ? `Wait ${timeLeft} sec` : "Create Another Post"}
          </Button>
        </Container>
      </div>
    </>
  );
};

export default memo(UserPostSaveMessage);
