"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Terms and Conditions</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-8">
            These Terms of Use including the Privacy Policy, and Risks ("Terms of Use") govern the use of the website of
            Niveshx platform [https://niveshx.app/] ("Website") and the services ("Services") provided on the Niveshx
            platform. By using the Website including but not limited to accessing or visiting or browsing the Website,
            you ("Visitor/User/Member") indicate your acceptance to these Terms of Use and that you agree to abide by
            them. The Terms of Use constitute a legal agreement between you, as the user of the Website, and us, the
            owner of the Website. If you do not agree to these Terms of Use, please refrain from using this Website. The
            Terms of Use shall be considered as part of any agreement, the reference to which shall be made in that
            agreement, and shall be read along with the terms and conditions of that agreement. In the event of a
            conflict between the terms of such agreements and the Terms of Use, the terms of such agreements will
            prevail and govern so long as they relate to matters specifically referenced herein and this Terms of Use
            will apply with respect to all other matters.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Information about us and the Niveshx platform</h2>
            <p className="text-gray-300 mb-4">
              <strong>1.1</strong> The Website is owned and operated by Startup Gurukul Innovation Private Limited
              ("we/us/our"). We have been incorporated under the Companies Act, 2013 under CIN U70200TS2024PTC181641
              having its registered office at 6-18-294, New NGOs Colony, Rythu Bazaar, Nizamabad 503002.
            </p>
            <p className="text-gray-300">
              <strong>1.2</strong> The NiveshX platform enables early-stage, growth-stage and established start-ups to
              display their shares that they would like to off-load in the secondary market or display their business
              ideas and run a fundraising campaign on the Website, and facilitates potential investors to decide
              regarding investing in such ventures. The Website also provides the startups and the potential investors
              with such other information and service as are necessary or incidental to the principal activity described
              here.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Access to the Website</h2>
            <p className="text-gray-300 mb-4">
              <strong>2.1</strong> By accessing the Website, you agree to these Terms of Use and the Privacy Policy set
              out. The access to certain sections of the Website is conditional upon our acceptance of you as a "member"
              or "issuing company" or "issuer" on the NiveshX Platform. We reserve the right to withdraw or amend the
              Services being provided to you through the Website without any notice. We will not be liable if for any
              reason our Website is not available to you at any period of time. Further, we have the right to restrict
              your access to the whole or part of the Website.
            </p>
            <p className="text-gray-300">
              <strong>2.2</strong> All rights that are not expressly granted to you are reserved under these Terms of
              Use.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Registration and Membership</h2>
            <p className="text-gray-300 mb-4">
              <strong>3.1</strong> If you are interested in exploring opportunities of investing in the issuer companies
              seeking to raise funding through the NiveshX Platform or issuer companies looking to off-load their
              shares, in order to have full functionality of the Website, you will have to register as a "member" on the
              NiveshX platform. The terms of registration including eligibility criteria and rights after becoming a
              member are available on our Website, and you may view them once you become a member of the NiveshX
              platform. In case of a conflict between the Terms of Use and the specific condition governing membership
              of the Niveshx Platform, the specific conditions of membership shall prevail.
            </p>
            <p className="text-gray-300">
              <strong>3.2</strong> If you are interested in running a secondary market transaction or a fundraising
              campaign through the NiveshX Platform, in order to have full functionality of the Website, you will have
              to register as an "issuing company" or the "issuer" on the NiveshX platform. The terms of registration
              including eligibility criteria and rights after enrolling as an "issuing company" or "issuer" are
              available on our Website. In case of a conflict between the Terms of Use and the specific condition
              governing your status as an "issuer company" or "issuer" on the NiveshX Platform, the specific conditions
              applicable to "issuer company" or "issuer" shall prevail.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Password to the Website</h2>
            <p className="text-gray-300 mb-4">
              <strong>4.1</strong> Upon completion of your registration to the Website, and upon reasonable satisfaction
              of our understanding of your engagement with us, an OTP to the email ID specified by you shall be
              provided. That OTP confirmation will allow you to participate in the fundraising campaign in which you
              have evinced your interest.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>4.2</strong> You agree not to provide your username and password information to any other person
              other than with us.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>4.3</strong> You agree to keep your password secure. You are fully responsible for any loss or
              damage resulting from your failure to protect your password. You agree to immediately notify us of any
              unauthorized use of your password or any other breach of the security.
            </p>
            <p className="text-gray-300">
              <strong>4.4</strong> You agree that we shall not be liable for any loss or damage arising out of our
              failure to keep your password secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Representations and Warranties of Users</h2>
            <p className="text-gray-300 mb-4">
              <strong>5.1</strong> You are entering into these Terms of Use on your own behalf or on behalf of the
              entity for whom you are acting provides a representation that you agree to abide by the Terms of Use or
              such other agreements that you may enter into while browsing through the Website. You agree to stop using
              the Website, and inform us of any violation of law that may stop you from using our Website.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>5.2</strong> You represent that all the information provided by you is true, correct, and accurate
              and you shall inform us of any change/ amendment in such information from time to time.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>5.3</strong> You shall not host, display, upload, modify, publish, transmit, update or share any
              information that: (i) belongs to another person and to which you do not have any right to; (ii) is grossly
              harmful, harassing, libellous, invasive of another's privacy, hateful or racially, ethnically
              objectionable, disparaging, relating or encouraging money laundering or gambling, otherwise unlawful in
              any manner whatsoever; (iii) harms minors in any way; (iv) infringes any patent trademark, copyright or
              other proprietary rights; (v) violates any law for the time being in force; (vi) deceives or misleads the
              addressee about the origin of such messages or communicates any information which is grossly offensive or
              menacing in nature; (vii) impersonates another person; (viii) threatens the unity, integrity, defence,
              security or sovereignty of India, friendly relations with friendly states, or public order or causes
              incitement to the commission of any cognisable offence or prevents investigation of any offence or is
              insulting any other nation.
            </p>
            <p className="text-gray-300">
              <strong>5.4</strong> You agree and understand that you shall not sell your access to the Website. You
              shall not transmit any unnecessary information or unwanted electronic communication viz. spam to other
              members of the NiveshX platform. You will not misuse your right to the Website by introducing viruses,
              trojans, worms, or other material likely to cause harm to the Website and shall indemnify and keep us
              indemnified in case any action is initiated against us due to any loss, injury, expenses or liability
              caused to any other user of the Website or any third-party. You shall further not gain any unauthorized
              access to the Website or on any other source to our Website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Our rights in relation to the Website</h2>
            <p className="text-gray-300 mb-4">
              <strong>6.1</strong> We have the right to discontinue or change our Services at any time and shall not be
              liable for the same.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>6.2</strong> We shall delete your account or cancel access to the Website for any reason
              whatsoever, at any time at our discretion. We shall also suspend or limit your access to the Website as
              and when may be considered necessary. For the aforesaid, we shall make all reasonable efforts to notify
              you and inform you of such an action and the reasons thereof, in any.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>6.3</strong> We shall disclose such confidential information as may be provided by you or such
              other details about yourself as may be necessary to satisfy any governmental department or authority under
              applicable law or to any third-party in accordance with the terms of the Privacy Policy.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>6.4</strong> With reference to Clauses 6.1, 6.2 and 6.3, you agree and understand that we shall
              not be liable for any claim based on any termination, suspension or any of the aforesaid actions taken by
              us in relation to your access to the Website.
            </p>
            <p className="text-gray-300">
              <strong>6.5</strong> We may invite you to participate in the chat rooms or other features that will give
              you an opportunity to know about the NiveshX platform, the companies and the fundraising campaigns of such
              companies. The comments or other information provided by you on such chat rooms shall be deemed to have
              been licensed to us on a free and permanent basis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property Rights</h2>
            <p className="text-gray-300 mb-4">
              <strong>7.1</strong> When you visit our Website, we give you a limited license to access and use our
              information for personal use.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>7.2</strong> You are permitted to download the information available on the Website to any
              instrument for your personal use only provided that you do not delete or change any copyright symbol,
              trademark or other proprietary details. You shall not use our information for any other purpose other than
              for the aforesaid. You agree that any use of the proprietary information displayed on the Website shall
              infringe our intellectual property rights for which you shall indemnify us.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>7.3</strong> We have copyright on all the contents displayed on the Website including graphics,
              logo, sound recordings and software that is either owned or licensed to us other than any third-party
              contents which are specifically identified as such. Any infringement of our intellectual property rights
              shall be governed by the applicable law in India.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>7.4</strong> The license to access and use the Website does not include the right to copy or
              reproduce the information of our Website on any other platform or medium, without our prior written
              permission.
            </p>
            <p className="text-gray-300">
              <strong>7.5</strong> Except where otherwise specified, any word, logo or device to which is attached the
              symbols ™ or ® shall be considered as a registered trademark that is either owned by us or which we have a
              license to use. The right to use the Website does not give a license to use those trademarks in any way.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Linked Websites</h2>
            <p className="text-gray-300 mb-4">
              <strong>8.1</strong> You may be able to access and view third-party websites through this Website. The
              links are provided for your convenience only and may not be updated at all times.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>8.2</strong> We do not endorse, review, control or examine third-party websites and we are not
              responsible for any content posted on such third-party websites. You understand that the inclusion of
              links on the Website is not intended as an endorsement or recommendation of any linked website or content
              of such website.
            </p>
            <p className="text-gray-300">
              <strong>8.3</strong> You agree that your access to any third-party website is governed by the terms of use
              of that website, and has no relation to the Terms of Use of the Website. You agree and understand that it
              is your responsibility to comply with the terms and conditions of that website as well.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimers and Limitation of Liability</h2>
            <p className="text-gray-300 mb-4">
              <strong>9.1</strong> You agree and understand that the use of the Website is at your own risk. The Website
              is being made available to you on an "as is" and "as available" basis without providing any warranties,
              guarantees or conditions as to the usage being free from any faults, defects, interruptions, errors,
              viruses or to the accuracy, reliability, availability of content. You agree and understand that we shall
              not be responsible for any interference or damage that may be caused to your computer resource which
              arises in connection with your access to our Website.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>9.2</strong> You also agree and understand that the information displayed on the Website is for
              information purposes only and does not amount to any advice.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>9.3</strong> To the extent permitted by applicable law, we disclaim our liability against any
              loss, damage, expenses, liabilities, claim, injury caused due to the failure of performance, omission,
              defect, deletion, interruption, error, delay, virus, communication, unauthorized access, theft,
              destruction, alteration or use of records, whether due to breach of the contract, negligence, tort or due
              to other cause of actions.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>9.4</strong> Further, we shall not be responsible for any loss of profits, goodwill, revenue,
              consequential, exemplary, punitive damages or any financial or indirect loss.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>9.5</strong> You further acknowledge and agree that we shall not be responsible for any
              defamatory, offensive or illegal conduct of third parties on our Website, including users and operators of
              third-party websites. Further, we shall not be responsible or be held liable for any inaccuracy, delay,
              omission or defect, transmission or delivery of any third-party data or any loss or damage arising from:
              (i) any inaccuracy, error, delay or omission of transmission of information; (ii) non-performance by any
              third-party; or (iii) interruption caused due to any third-party due to their negligent act or omission
              any other cause, not beyond the reasonable control of us.
            </p>
            <p className="text-gray-300">
              <strong>9.6</strong> Notwithstanding anything in the Terms of Use, the total liability for damages
              actually incurred by you shall be limited to Rs. 1,00,000 (Rupees One Lakh Only). The aforesaid applies to
              all liabilities in the aggregate, including but not limited to, liabilities arising out of the use of the
              Website, any other subject matter arising out of or in relation to the use of the Website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">10. Indemnity</h2>
            <p className="text-gray-300">
              <strong>10.1</strong> You hereby agree to indemnify and hold us harmless from and against any loss,
              damage, expenses, liabilities or claims arising out of or in relation to your failure to comply with the
              Terms of Use or any misstatement or breach of any representations or warranties made by you under the
              Terms of Use or under any conditions on the Website accepted by you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law and Dispute Resolution</h2>
            <p className="text-gray-300 mb-4">
              <strong>11.1 Governing Law:</strong> The Terms of Use shall be governed by and construed in all respects
              in accordance with the laws of India and subject to Clause 11.3 below, the courts of Hyderabad shall have
              exclusive jurisdiction.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>11.2 Informal Dispute Resolution:</strong> The Parties agree to attempt to resolve all disputes
              arising hereunder, promptly and in good faith and in this regard, each Party shall each designate in
              writing to the other Party, a representative who shall be authorized to negotiate and resolve on its
              behalf any dispute arising under these Terms of Use. If the designated representatives of each of the
              Parties are unable to resolve a dispute under the Terms of Use within 30 (thirty) days after notice of
              such dispute shall have been given by either of the Parties to the other, then either Party may require
              that such dispute be determined and resolved by arbitration.
            </p>
            <p className="text-gray-300">
              <strong>11.3 Arbitration:</strong> Subject to Clause 11.2, any dispute or claim under the Terms of Use
              shall be referred to and finally and exclusively resolved by arbitration in accordance with the
              Arbitration and Conciliation Act, 1996 or any statutory modification or re-enactment thereof for the time
              being in force. The arbitration shall be held at Hyderabad and all proceedings in any such arbitration
              shall be conducted in English. There shall be 3 (three) arbitrators ("Arbitrators"), all of whom shall be
              fluent in English. Within thirty 30 (thirty) Days of the reference of the dispute to arbitration, the
              Party raising the dispute and making the reference to arbitration shall appoint one Arbitrator and the
              other Party shall appoint the other Arbitrator. The third Arbitrator shall be appointed by the 2 (two)
              appointed Arbitrators. The arbitral award shall be final and binding upon the parties. The Parties shall
              equally bear the costs and expenses for the conduct of the arbitration proceedings, however; each Party
              shall bear their own legal expenses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">12. Amendments to the Terms of Use</h2>
            <p className="text-gray-300 mb-4">
              <strong>12.1</strong> We reserve the right to amend the Terms of Use from time to time. Any amendment that
              is made will come into effect from the moment it is displayed on the Website. The updated version of the
              Terms of Use shall supersede any of the previous versions of the Terms of Use.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>12.2</strong> We shall make reasonable efforts to notify the members of such changes, however, it
              shall be your responsibility to be updated with the Terms of Use at all times.
            </p>
            <p className="text-gray-300">
              <strong>12.3</strong> The continued use of the Website shall amount to your acceptance to the Terms of Use
              of the Website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">13. What is Power of Attorney (POA)?</h2>
            <p className="text-gray-300 mb-4">
              <strong>13.1</strong> Power of Attorney Act 1882, power of attorney includes any instrument empowering a
              specified person to act for and in the name of the person executing it.
            </p>
            <p className="text-gray-300">
              <strong>13.2</strong> POA is very well known as Power of Attorney or Power of Authority which is the
              authority to act for another person in specified or all legal or financial matters. The one who gives an
              authority to some trustable person is known as a principal or a donor. There are various situations in
              one's life where an individual possessing properties, bank accounts, etc. may not be in a position to
              perform his duties due to reasons like being abroad, physically ill, old in age etc. In such situations,
              if the transaction requires the presence of the individual who is not able to be present personally, then
              the only way out is to give the powers to act on behalf of the individual to another person. This is when
              a Power of Attorney deed is to be created.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">14. Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              <strong>14.1</strong> Any transaction in securities that companies may offer or conclude with any other
              member of the platform shall be offered, issued, allotted or transferred in strict compliance of all
              applicable laws including but not limited to private placement rules under applicable securities laws.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>14.2</strong> Our platform has an internal mechanism to restrict the number of Investors that view
              the detailed profile to 200 by default thereby making it compliant with the applicable laws. However, it
              shall be the company's responsibility to comply with the provisions of applicable laws including the
              Companies Act, 2013 and the private placement rules thereunder.
            </p>
            <p className="text-gray-300">
              <strong>14.3</strong> Nothing on this website is intended to constitute (i) an offer, or solicitation of
              an offer, to purchase or sell any security, other asset or service, (ii) investment advice or an offer to
              provide such advice, or (iii) a basis for making any investment decision. Except as expressly stated by
              NiveshX's entity in writing, neither this website nor any of the materials make any effort to present a
              comprehensive or balanced description of NiveshX or its investment activities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">15. Miscellaneous</h2>
            <p className="text-gray-300 mb-4">
              <strong>15.1 No partnership or agency:</strong> The Terms of Use shall not be construed so as to create a
              partnership or joint venture between you and us. Nothing in the Terms of Use shall be construed so as to
              constitute you and us as agents of one another.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>15.2 Specific Performance:</strong> Each one of us agrees that damages may not be an adequate
              remedy and that either of us shall be entitled to an injunction, restraining order, right for recovery,
              suit for specific performance or such other equitable relief as a court of competent jurisdiction may deem
              necessary or appropriate to restrain the other, from committing any violation or enforce the performance
              of the covenants, representations and obligations contained in the Terms of Use. These injunctive remedies
              are cumulative and are in addition to any other rights and remedies the Parties may have at law or in
              equity, including without limitation a right for damages.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>15.3 Severability:</strong> Each and every obligation under the Terms of Use shall be treated as a
              separate obligation and shall be severally enforceable as such in the event of any obligation or
              obligations being or becoming unenforceable in whole or in part. To the extent that any provision or
              provisions of the Terms of Use are unenforceable, both of us shall endeavour to amend such clauses as may
              be necessary to make the provision or provisions valid and effective. Notwithstanding the foregoing, any
              provision which cannot be amended as may be necessary to make it valid and effective shall be deemed to be
              deleted from the Terms of Use and any such deletion shall not affect the enforceability of the remainder
              of the Terms of Use not so deleted provided the fundamental terms of the Terms of Use are not altered.
            </p>
            <p className="text-gray-300">
              <strong>15.4 Non-Exclusive Remedies:</strong> The rights and remedies herein provided are cumulative and
              none is exclusive of any other rights and remedies available at law or in equity.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
