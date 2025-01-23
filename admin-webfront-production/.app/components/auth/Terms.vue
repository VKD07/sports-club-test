<script setup lang="ts">
const isModalTermsOpen = ref(false)
</script>

<template>
  <NuxtLink
    @click="isModalTermsOpen = true"
    class="text-muted-600 hover:text-primary-500 dark:text-muted-200 font-sans font-medium text-xs underline-offset-4 transition duration-150 ease-in-out cursor-pointer"
  >
    Terms & Conditions
  </NuxtLink>

  <!-- Add Category component -->
  <div>
    <TairoModal :open="isModalTermsOpen" size="3xl" @close="isModalTermsOpen = false">
      <template #header>
        <!-- Header -->
        <div class="relative">
          <div class="p-6 pe-16">
            <div class="flex gap-4 lg:items-center justify-between flex-col lg:flex-row">
              <div>
                <BaseHeading
                  tag="h2"
                  size="xl"
                  weight="bold"
                  lead="normal"
                  class="uppercase tracking-wider text-primary-500 dark:text-muted-100"
                >
                  Terms & Conditions
                </BaseHeading>
              </div>
            </div>
          </div>

          <BaseButtonClose
            @click="isModalTermsOpen = false"
            class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
          />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-[calc(100vh-16rem)]">
        <div class="prose prose-light">
          <h3>EStars’ Esports Club – Terms of Use</h3>

          <p>
            EStars Esports Club is owned by First For E Players, trading as EStars, 4 Mason Court
            Gillan Way, Penrith 40 Business Park, Penrith, United Kingdom, CA11 9GR. This Platform
            is hosted in the cloud, in accordance with legal cloud compliance.
          </p>

          <p>
            Welcome to the EStars’ Esports Club, our online educational platform (the
            “<strong>Platform</strong>”)! Before you begin using the Platform, please carefully read
            and understand the following Terms of Use. By accessing or using the Platform, you agree
            to be bound by these terms. If you do not agree with any part of these terms, you may
            not use the Platform.
          </p>

          <h4>Acceptance of Terms</h4>

          <p>
            1. By accessing or using the Platform, you acknowledge that you have read, understood,
            and agree to be bound by these Terms of Use, as well as any other policies or guidelines
            referenced herein. These terms apply to all users, including but not limited to
            students, parents, guardians, educators, and any other individuals or entities accessing
            the platform.
          </p>

          <h4>Age Requirement</h4>

          <p>
            2. The Platform is intended for use by students aged 7 years old and above. If you are
            under the age of 18, you must obtain permission from your parent or legal guardian
            before using our services.
          </p>

          <h4>User Accounts</h4>
          <p>
            3. In order to access certain features of the Platform, you may be required to create a
            user account. When creating an account, you agree to provide accurate, current, and
            complete information about yourself.
          </p>
          <p>
            4. You are solely responsible for maintaining the confidentiality of your account
            credentials, including your username and password. You agree to notify us immediately of
            any unauthorised use of your account.
          </p>
          <p>
            5. You may not share your account credentials with any third party or allow any third
            party to access your account.
          </p>

          <h4>User Conduct</h4>

          <p>
            6. You agree to use the Platform for lawful purposes only and to comply with all
            applicable laws and regulations.
          </p>
          <p>
            7. You may not use the Platform to engage in any conduct that is harmful, abusive,
            harassing, threatening, defamatory, obscene, or otherwise objectionable.
          </p>
          <p>
            8. You may not attempt to interfere with the proper functioning of the Platform or to
            circumvent any security measures.
          </p>

          <h4>Educational Activities and Tasks</h4>
          <p>
            9. The Platform offers a variety of educational activities and tasks designed to enhance
            learning. You agree to use these resources responsibly and to respect the intellectual
            property rights of others.
          </p>
          <p>
            10. You may not use the Platform to cheat, plagiarise, or engage in any other form of
            academic dishonesty.
          </p>

          <h4>Tournaments</h4>
          <p>
            11. From time to time, the Platform may host tournaments or competitions. Participation
            in these events is voluntary and subject to additional terms and conditions.
          </p>
          <p>
            12. We reserve the right to disqualify any participant who violates these terms or
            engages in any form of cheating or misconduct.
          </p>

          <h4>Webinars and Tutorials</h4>
          <p>
            13. The Platform may provide access to webinars and tutorials on various topics. These
            resources are intended for educational purposes only and may not be reproduced or
            distributed without permission.
          </p>

          <p>
            14. The views and opinions expressed in webinars and tutorials are those of the
            presenters and do not necessarily reflect our own views.
          </p>

          <h4>Termination of Access</h4>
          <p>
            15. We reserve the right to suspend or terminate your access to the Platform at any
            time, without prior notice, for any reason or no reason, including but not limited to a
            violation of these terms.
          </p>

          <h4>Modifications to Terms</h4>
          <p>
            16. We may update or modify these Terms of Use from time to time without prior notice.
            It is your responsibility to review these terms periodically for any changes. Your
            continued use of the Platform after the posting of any modifications constitutes
            acceptance of those changes.
          </p>

          <h4>Contact Information</h4>
          <p>
            17. If you have any questions or concerns about these Terms of Use, please contact us at
            info@estars.pro.
          </p>
          <p>18. By using the Platform, you agree to abide by these Terms of Use.</p>

          <br />

          <h3>Code of Conduct</h3>
          <p>
            We are dedicated to providing a safe, supportive, and enriching environment for all
            users. To ensure a positive experience for everyone, we have established the following
            Code of Conduct:
          </p>

          <p><strong>1.Respect for Others:</strong></p>
          <ul>
            <li>Treat all users with kindness, respect, and empathy.</li>
            <li>Avoid discriminatory, offensive, or inappropriate language and behaviour.</li>
            <li>Be mindful of cultural differences and diverse perspectives.</li>
          </ul>

          <p><strong>2. Online Safety:</strong></p>
          <ul>
            <li>Protect your personal information and respect the privacy of others.</li>
            <li>
              Do not share personal contact information, passwords, or sensitive data with other
              users.
            </li>
            <li>
              Report any suspicious or harmful behaviour to the Platform administrators immediately.
            </li>
          </ul>

          <p><strong>3. Fair Play:</strong></p>
          <ul>
            <li>Play games and participate in activities with integrity and honesty.</li>
            <li>
              Do not engage in cheating, hacking, or exploiting glitches to gain an unfair
              advantage.
            </li>
            <li>
              Respect the rules and guidelines set forth by game publishers and hardware
              manufacturers.
            </li>
          </ul>

          <p><strong>4. Responsible Gaming:</strong></p>
          <ul>
            <li>
              Set reasonable limits on the amount of time spent gaming and take breaks as needed.
            </li>
            <li>
              Balance gaming activities with other responsibilities, such as schoolwork and family
              commitments.
            </li>
            <li>Seek help if gaming becomes excessive or negatively impacts your well-being.</li>
          </ul>

          <p><strong>5. Intellectual Property Rights:</strong></p>
          <ul>
            <li>
              Respect the intellectual property rights of others, including game developers, content
              creators, and platform administrators.
            </li>
            <li>Do not plagiarise or unlawfully distribute copyrighted material.</li>
          </ul>

          <p><strong>6. Positive Community Engagement:</strong></p>
          <ul>
            <li>
              Contribute to a supportive and inclusive community by sharing knowledge, resources,
              and constructive feedback.
            </li>
            <li>
              Participate in webinars, podcasts, tutorials, and tournaments with enthusiasm and
              sportsmanship.
            </li>
          </ul>

          <p><strong>7. Compliance with Rules and Regulations:</strong></p>
          <ul>
            <li>
              Abide by the rules and regulations set forth by hardware manufacturers, game
              publishers, and platform administrators.
            </li>
            <li>
              Familiarise yourself with the terms of service and end-user license agreements of the
              games and software used on the platform.
            </li>
          </ul>

          <p><strong>8. Reporting Violations:</strong></p>
          <ul>
            <li>
              Report any violations of this Code of Conduct or any suspicious activity the Platform
              administrators promptly.
            </li>
            <li>Provide accurate and detailed information when reporting incidents.</li>
          </ul>

          <p><strong>9. Consequences of Violations:</strong></p>
          <ul>
            <li>
              Violations of this Code of Conduct may result in disciplinary action, including
              temporary or permanent suspension of the Platform privileges.
            </li>
            <li>
              Repeat offenders may be subject to more severe penalties, up to and including
              expulsion from the Platform.
            </li>
          </ul>

          <p>
            By accessing and using the Platform, you agree to abide by this Code of Conduct and to
            uphold the values of respect, integrity, and responsibility. Thank you for helping us
            maintain a positive and welcoming community for all users.
          </p>

          <p>Thank you for choosing the Platform for your educational and gaming needs!</p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalTermsOpen = false"> Cancel </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
