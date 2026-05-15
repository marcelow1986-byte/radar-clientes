import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [clientes, setClientes] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  async function carregarClientes() {
    setCarregando(true)

    const { data, error } = await supabase
      .from('clientes')
      .select('*')

    if (error) {
      setErro(JSON.stringify(error, null, 2))
      setCarregando(false)
      return
    }

    setClientes(data || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Radar Comercial/Técnico</h1>

      <p><strong>Status:</strong> {carregando ? 'Carregando...' : 'Finalizado'}</p>
      <p><strong>Total clientes:</strong> {clientes.length}</p>

      {erro && (
        <pre style={{ background: '#fee', padding: 10, color: 'red' }}>
          {erro}
        </pre>
      )}

      {clientes.map(cliente => (
        <div key={cliente.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <strong>{cliente.cliente}</strong>
          <p>{cliente.endereco_completo}</p>
          <p>{cliente.telefone}</p>
        </div>
      ))}
    </div>
  )
}

export default App