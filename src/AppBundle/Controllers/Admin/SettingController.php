<?php

namespace Webberdoo\AppBundle\Controllers\Admin;


use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;use Symfony\Component\HttpFoundation\Request;
use Webberdoo\AppBundle\Entity\Setting;

/**
 * Setting controller.
 *
 * @Route("admin/setting")
 */
class SettingController extends Controller
{
    /**
     * Lists all setting entities.
     *
     * @Route("/", name="admin_setting_index")
     * @Method("GET")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $settings = $em->getRepository('AppBundle:Setting')->findAll();

        return $this->render($this->getParameter('theme_name').'/admin/setting/index.html.twig', array(
            'settings' => $settings,
        ));
    }

    /**
     * Creates a new setting entity.
     *
     * @Route("/new", name="admin_setting_new")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $settings = $em->getRepository('AppBundle:Setting')->getFirstSetting();

        if(count($settings) == 0)
        {
            $setting = new Setting();
            $form = $this->createForm('AppBundle\Form\SettingType', $setting);
            $form->handleRequest($request);

            if ($form->isSubmitted() && $form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($setting);
                $em->flush($setting);

                return $this->redirectToRoute('admin_setting_index');

            }

            return $this->render($this->getParameter('theme_name').'/admin/setting/new.html.twig', array(
                'setting' => $setting,
                'form' => $form->createView(),
            ));
        }else{
            return $this->redirectToRoute('admin_setting_edit', array('id' => $settings->getId()));
        }

    }


    /**
     * Finds and displays a setting entity.
     *
     * @Route("/{id}", name="admin_setting_show")
     * @Method("GET")
     */
    public function showAction(Setting $setting)
    {
        $deleteForm = $this->createDeleteForm($setting);

        return $this->render($this->getParameter('theme_name').'/admin/setting/show.html.twig', array(
            'setting' => $setting,
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Displays a form to edit an existing setting entity.
     *
     * @Route("/{id}/edit", name="admin_setting_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, Setting $setting)
    {
        $deleteForm = $this->createDeleteForm($setting);
        $editForm = $this->createForm('AppBundle\Form\SettingType', $setting);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted() && $editForm->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('admin_setting_index');
        }

        return $this->render($this->getParameter('theme_name').'/admin/setting/edit.html.twig', array(
            'setting' => $setting,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Deletes a setting entity.
     *
     * @Route("/{id}", name="admin_setting_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, Setting $setting)
    {
        $form = $this->createDeleteForm($setting);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($setting);
            $em->flush($setting);
        }

        return $this->redirectToRoute('admin_setting_index');
    }

    /**
     * Creates a form to delete a setting entity.
     *
     * @param Setting $setting The setting entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm(Setting $setting)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('admin_setting_delete', array('id' => $setting->getId())))
            ->setMethod('DELETE')
            ->getForm()
        ;
    }
}
