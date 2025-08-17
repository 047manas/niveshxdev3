"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0D1B2A]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Nivesh</span>
            <span className="text-[#3BB273]">x</span>
          </Link>
          <Button
            asChild
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-[#3BB273]/20 transition-all duration-200 border border-gray-600 hover:border-[#3BB273]"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-8">
            The privacy policy ("Privacy Policy") governs the use of the website of the Niveshx platform
            [https://niveshx.app/] ("Website", "we", "us") and the services ("Services") being provided on the Website.
            This Privacy Policy has been duly framed in accordance with the Information Technology Act, 2000 ("Act") and
            the Rules made thereunder to ensure maximum protection to the information provided by its users ("you"). By
            using the Website, you agree to abide by the terms and conditions pertaining to collection, retention, and
            use of information set forth in this Privacy Policy. If you do not agree to the Privacy Policy, you may exit
            and cease to use the Website. This Privacy Policy is incorporated in the Terms and Conditions of the Niveshx
            platform and any other agreement, in which there is a specific clause incorporating the Privacy Policy in
            such agreement. In the event of a conflict between the terms of such agreements and the Privacy Policy, the
            terms of such agreements will prevail and govern so long as they relate to matters specifically referenced
            herein and this Privacy Policy will apply with respect to all other matters.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Our role in the protection of User Information</h2>
            <p className="text-gray-300 mb-4">
              Upon landing on the Website, as a rule, we do not collect any information from you. However, we collect,
              retain and process the information provided by you through e-mail or filing of forms on the Website
              including but not limited to Information such as your name, address, contact details, email id, details of
              the organization on behalf of whom you are acting (if applicable) and financial information such as bank
              account or credit card or debit card or other payment instruments, identity proof, etc. ("Personal
              Information").
            </p>
            <p className="text-gray-300 mb-4">
              Further, we collect, store, and process such other information including but not limited to your
              Authentication Token, communication made by you, information posted by you on the chat rooms, and any
              modifications made to the information provided by you ("Other Information").
            </p>
            <p className="text-gray-300 mb-4">
              We may also collect certain automatically generated information including the IP address, date and time of
              visiting the Website, online activity. We may engage third-party services to monitor and collect such
              information that will enable us to verify your credentials, maintain reasonable security practices, enable
              inclusion of better Services, fulfill your requests and enhance your user experience. Further, we may also
              collect cookies (a piece of software code that the Website automatically sends to your browser when you
              access the Website) that enable us to provide you a better user experience. We do not link the information
              we store on the cookies to any personally identifiable information submitted by you. Also, some of the
              business partners' i.e. third parties operating in association with the Website have cookies on our
              Website. The use of cookies by them is subject to the privacy policy and other terms and conditions
              governing their website ("Automatically Generated Information")
            </p>
            <p className="text-gray-300">
              Personal Information, Other Information, and Automatically Generated Information shall together be
              referred to as "User Information".
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Use of User Information</h2>
            <p className="text-gray-300 mb-4">
              The User Information provided by you may be used by us and provided to third party websites, affiliates,
              consultants, employees in order to manage, collect, store, process the User Information in order to
              improve the quality, design, functionality, and content of the Website and to any governmental authority
              under applicable law.
            </p>
            <p className="text-gray-300 mb-4">
              The User Information provided by you shall be used to communicate with us through newsletters, updates,
              notifications, and other forms of communication. Further, we may telephonically contact you to collect or
              verify the information provided by you. The communication with you might be recorded but will be kept
              confidential otherwise when asked to disclose to any governmental authority under applicable law.
            </p>
            <p className="text-gray-300 mb-4">
              The User Information shall be used for purposes only in relation to the Website and not for any other
              purposes. The User Information shall be retained till the termination of your membership/listing on the
              Niveshx platform or up to such other period as may be considered necessary by us for the purpose of
              operating the Website.
            </p>
            <p className="text-gray-300 mb-4">
              You shall have the right to view the information provided by you and also to update the information and
              keep us informed of any such change in case the information provided is deficient or inaccurate.
            </p>
            <p className="text-gray-300 mb-4">
              You undertake that the Personal Information and Other Information provided by you is true and accurate to
              the best of your knowledge. You agree and understand that we shall not be liable for the authenticity of
              the Personal Information and Other Information provided by you.
            </p>
            <p className="text-gray-300">
              You shall provide us with all the information requested from you on the Website or through any other mode
              of communication. You are not legally obligated to provide us with all the information. However, the
              complete functionality of the Website shall not be rendered possible if you fail to provide us with the
              certain necessary information for the purpose of the Services of the Website. Without prejudice to the
              aforesaid, you shall have an option too, while availing the Services otherwise, withdraw your consent to
              allow us to use the Personal Information provided by you and intimate us of the same in writing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Disclosure of User Information</h2>
            <p className="text-gray-300 mb-4">
              Any Personal Information provided by you shall be made available to only our affiliates, third parties,
              employees, consultants, screening committee members, mentors, or other officers that are connected with or
              in relation to the Services of the Website. Such third parties shall not disclose the User Information
              disclosed to it further other than under such circumstances where disclosure is permissible by us under
              the terms and conditions of the Privacy policy.
            </p>
            <p className="text-gray-300">
              Other than as set out above, we shall not disclose the User Information to any third-party without your
              written consent provided that such information may be disclosed to governmental agencies or bodies as
              required under applicable law or to exercise legal rights or defend legal claims or protect the safety of
              other users or public or our rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Links to third-party websites</h2>
            <p className="text-gray-300">
              The Website contains links to third-party websites. We are not responsible for any content on such
              third-party websites and we shall not be liable for any breach of the privacy policy by such websites. You
              undertake to read and understand the privacy policy of such third-party websites. For the avoidance of
              doubt, our Privacy Policy only governs the User Information collected, received, possessed, stored, dealt,
              with, or handled for the purposes of Services on our Website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Notification and Updates sent by the Website</h2>
            <p className="text-gray-300 mb-4">
              We send an email notification to individuals once they login to the Website as a member of the Niveshx
              platform. Further, we may send regular newsletters, updates, and other promotional information to you
              informing you of the updates on the Niveshx platform.
            </p>
            <p className="text-gray-300">
              Out of courtesy towards your privacy, we give you the option to opt-out of any Services on the Website. If
              you choose not to opt-out of any particular Service, you agree to get information regarding such Services.
              In order to clarify, we only send you information if you have chosen to receive it. In case you wish to
              discontinue any Services, you can choose to unsubscribe such Services by choosing the unsubscribe option
              in the emails sent to you or tabs available on the Website. However, you shall not be able to opt-out of
              any Service notification that may be necessary in the process of the Website or that may be important to
              you as a member of the Niveshx platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Security Practices</h2>
            <p className="text-gray-300">
              The User Information shall be governed by and protected by us according to the security practices and
              procedures mandated under the Act and more particularly described under the Information Technology
              (Reasonable Security Practices & Procedures and Sensitive Personal Data or Information) Rules, 2011 and
              Information Technology (Intermediary Guidelines) Rules, 2011.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Alteration of the Privacy Policy</h2>
            <p className="text-gray-300">
              The Privacy Policy may be amended, modified, or refined from time to time at our sole discretion and the
              updated Privacy Policy shall be published on the Website and no separate communication shall be made in
              respect of the same. It shall be your responsibility to keep yourself updated with changes to the Privacy
              Policy by regularly checking the Website for updates. Usage of the Website's Services pursuant to a change
              in its Privacy Policy shall be deemed to be acquiescence of the changed Privacy Policy on your behalf.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Disclaimer of liability for User Information Security
            </h2>
            <p className="text-gray-300 mb-4">
              We take appropriate measures as envisaged under Clause 5 of the Privacy Policy for the protection of the
              User Information. All the employees, consultants, screening committee members, mentors, and officers shall
              always be kept updated on the security and privacy protection procedures or methods.
            </p>
            <p className="text-gray-300 mb-4">
              Notwithstanding the aforesaid, despite our efforts to maintain privacy and confidentiality of the User
              Information, we may not be able to protect or prevent the unauthorized access or use, software failure or
              fault, or other factors that may compromise the security of the User Information.
            </p>
            <p className="text-gray-300">
              You agree and understand that the Internet is not a secure source and therefore, we cannot guarantee the
              protection of such User Information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Grievance Redressal Mechanism</h2>
            <p className="text-gray-300 mb-4">
              In order to address any of your grievances or discrepancies of the information displayed on the Website,
              the Website shall designate a grievance redressal officer ("Grievance Officer"). Akshay Narvate shall be
              the Grievance Officer of the Website.
            </p>
            <p className="text-gray-300">
              The Grievance Officer shall redress all the grievances expeditiously but within 1(one) month from the date
              of receipt of the grievance as provided under the Act.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
