import type { NextFunction, Request, Response } from "express";

export function validarCamposBody(camposPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const camposRecebidos = Object.keys(req.body ?? {});
    const camposInvalidos = camposRecebidos.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (camposInvalidos.length > 0) {
      res.status(400).json({
        sucesso: false,
        erro: {
          mensagem: `Campo(s) não permitido(s): ${camposInvalidos.join(", ")}`,
          tipo: "ErroValidacao",
          detalhes: `Campos permitidos: ${camposPermitidos.join(", ")}`,
        },
      });
      return;
    }

    next();
  };
}
