<script setup lang="ts">
const isModalSafetyOpen = ref(false)
</script>

<template>
  <NuxtLink
    @click="isModalSafetyOpen = true"
    class="text-muted-600 hover:text-primary-500 dark:text-muted-200 font-sans font-medium text-xs underline-offset-4 transition duration-150 ease-in-out cursor-pointer"
  >
    Online Safety
  </NuxtLink>

  <!-- Add Category component -->
  <div>
    <TairoModal :open="isModalSafetyOpen" size="3xl" @close="isModalSafetyOpen = false">
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
                  Online Safety
                </BaseHeading>
              </div>
            </div>
          </div>

          <BaseButtonClose
            @click="isModalSafetyOpen = false"
            class="absolute right-6 top-6 border-2 border-muted-500 rounded !text-muted-500 !h-6 !w-6"
          />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:pt-0 md:p-6 overflow-y-scroll max-h-[calc(100vh-16rem)]">
        <div class="prose prose-light">
          <h3>Online Safety Policy Statement for First for E Players Limited</h3>

          <h4>1.Introduction</h4>

          <p>
            This Platform is owned by First For E Players, trading as EStars, 4 Mason Court Gillan
            Way, Penrith 40 Business Park, Penrith, United Kingdom, CA11 9GR. This Platform is
            hosted in the cloud, in accordance with legal cloud compliance.
          </p>

          <p>
            The Company has adopted this online safety policy statement and expects every adult
            working, consulting, advising or volunteering at the Company to support it and comply
            with it. Consequently, this policy should apply to all staff, consultants, service
            providers, advisors, managers, trustees, directors, volunteers, students or anyone
            working on behalf of, engaged by and/or in conjunction with the Company.
          </p>

          <h4>2.Purpose of the Policy</h4>

          <p>
            The Company works with children and young people as part of its activities. Under this
            policy, the term children shall mean any person who is under eighteen years of age. This
            policy is intended to protect the online safety of children who receive any service from
            us, including those who are the children of adults who may receive services from us.
            This policy should be read in conjunction with our Safeguarding and Child Protection
            Policy and any online abuse reported in accordance with that policy.
          </p>

          <h4>3.Principle and statement of intent</h4>

          <p>
            The welfare of the children using our services is paramount. We are committed to
            creating an online environment in which children are safe from harm and abuse, and in
            which any suspicion of harm or abuse is promptly and appropriately responded to.
          </p>

          <p>We recognise that:</p>

          <ul>
            <li>
              the online world provides everyone with many opportunities; however, it can also
              present risks and challenges;
            </li>
            <li>
              we have a duty to ensure that all children, young people and adults involved in our
              organisation are protected from potential harm online;
            </li>
            <li>
              we have a responsibility to keep children safe online when they are using the
              Company’s services.
            </li>
            <li>
              working in partnership with children, young people, their parents, carers and other
              agencies is essential in promoting young people’s welfare and in helping young people
              to be responsible in their approach to online safety; and
            </li>
            <li>
              all children, regardless of age, disability, gender reassignment, race, religion or
              belief, sex or sexual orientation, have the right to equal protection from all types
              of harm or abuse.
            </li>
          </ul>

          <h4>4.Safeguarding principles</h4>
          <p>We will seek to keep children and young people safe by:</p>

          <ul>
            <li>appointing an online safety co-ordinator;</li>
            <li>
              providing clear and specific directions to staff and volunteers on how to behave;
            </li>
            <li>
              supporting and encouraging the young people using our service to use the internet,
              social media and mobile phones in a way that keeps them safe and shows respect for
              others;
            </li>
            <li>
              supporting and encouraging parents and carers to do what they can to keep their
              children safe online;
            </li>
            <li>
              developing clear and robust procedures to enable us to respond appropriately to any
              incidents of inappropriate online behaviour, whether by an adult or a child or young
              person reviewing and updating the security of our information systems regularly;
            </li>
            <li>
              ensuring that usernames, logins, email accounts and passwords are used effectively;
            </li>
            <li>
              ensuring personal information about the adults and children who are involved in our
              organisation is held securely and shared only as appropriate;
            </li>
            <li>
              ensuring that images of children, young people and families are used only after their
              written permission has been obtained, and only for the purpose for which consent has
              been given;
            </li>
            <li>
              providing supervision, support and training for staff and volunteers about online
              safety; and
            </li>
            <li>
              examining and risk assessing any social media platforms and new technologies before
              they are used within the organisation.
            </li>
          </ul>

          <h4>5.Procedure for reporting concerns</h4>
          <p>If online abuse occurs, we will respond to it by:</p>

          <ul>
            <li>
              having clear and robust safeguarding procedures in place for responding to abuse
              (including online abuse);
            </li>
            <li>
              providing support and training for all staff and volunteers on dealing with all forms
              of abuse, including bullying or cyberbullying, emotional abuse, sexting, sexual abuse,
              and sexual exploitation.
            </li>
            <li>
              making sure our response takes the needs of the person experiencing abuse, any
              bystanders and our organisation as a whole into account; and
            </li>
            <li>
              reviewing the plan developed to address online abuse at regular intervals, in order to
              ensure that any problems have been resolved in the long term.
            </li>
          </ul>
          <p>Dated: 27 December 2023</p>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModalSafetyOpen = false"> Cancel </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
