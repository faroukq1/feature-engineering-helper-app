import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const page = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <Link
        className={buttonVariants({
          variant: "outline",
        })}
        href="/login"
      >
        login
      </Link>
    </div>
  );
};

export default page;
